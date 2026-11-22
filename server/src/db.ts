import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logger } from './logger';
import { DatabaseError } from './errors';
import { DiagnosticReport } from '../../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const log = logger.forModule('Database');

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'quizquake.db');
const LEGACY_HISTORY_PATH = path.join(DB_DIR, 'history.json');

// Ensure data folder exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export class DatabaseService {
  private db: sqlite3.Database;
  private writeQueue: Promise<unknown> = Promise.resolve();
  public readyPromise: Promise<void>;

  constructor(dbPath: string = DB_PATH) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        log.error('Failed to connect to SQLite database', err);
      } else {
        log.info('Connected to SQLite relational database', { dbPath });
      }
    });

    this.readyPromise = this.initializeTables().then(() => this.migrateLegacyHistory());
  }

  private async run(sql: string, params: unknown[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (this: sqlite3.RunResult, err: Error | null) {
        if (err) return reject(new DatabaseError(err.message, { sql, params }));
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  private async get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err: Error | null, row: T) => {
        if (err) return reject(new DatabaseError(err.message, { sql, params }));
        resolve(row);
      });
    });
  }

  private async all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: Error | null, rows: T[]) => {
        if (err) return reject(new DatabaseError(err.message, { sql, params }));
        resolve(rows || []);
      });
    });
  }

  /**
   * Concurrency Guard: Enqueue write operations sequentially to prevent race conditions
   */
  public async enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
    await this.readyPromise;
    const resultPromise = this.writeQueue.then(operation, operation);
    this.writeQueue = resultPromise.then(() => {}, () => {});
    return resultPromise;
  }

  private async initializeTables(): Promise<void> {
    try {
      // WAL mode for fast concurrent reads and ACID safe writes
      await this.run('PRAGMA journal_mode = WAL;');
      await this.run('PRAGMA synchronous = NORMAL;');
      await this.run('PRAGMA busy_timeout = 5000;');

      // 1. Sessions Table (supports tracking, termination, and rapid abandonment)
      await this.run(`
        CREATE TABLE IF NOT EXISTS quiz_sessions (
          id TEXT PRIMARY KEY,
          student_name TEXT NOT NULL,
          mode TEXT NOT NULL,
          domain TEXT,
          total_questions INTEGER NOT NULL,
          current_question_index INTEGER NOT NULL DEFAULT 1,
          status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'COMPLETED', 'ABANDONED')),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      // 2. Diagnostic Reports Table (Relational replacement for history.json)
      await this.run(`
        CREATE TABLE IF NOT EXISTS diagnostic_reports (
          id TEXT PRIMARY KEY,
          session_id TEXT,
          student_name TEXT NOT NULL,
          quiz_title TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          total_questions INTEGER NOT NULL,
          correct_count INTEGER NOT NULL,
          raw_accuracy REAL NOT NULL,
          scaled_ability_theta REAL NOT NULL,
          scaled_ability_score REAL NOT NULL,
          total_score_points INTEGER NOT NULL,
          max_streak INTEGER NOT NULL,
          total_time_spent_seconds INTEGER NOT NULL,
          report_json TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE SET NULL
        );
      `);

      // 3. Question Response Audit Table (for individual answer analytics)
      await this.run(`
        CREATE TABLE IF NOT EXISTS question_responses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          report_id TEXT NOT NULL,
          question_id TEXT NOT NULL,
          topic TEXT NOT NULL,
          subtopic TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          selected_option INTEGER NOT NULL,
          correct_answer INTEGER NOT NULL,
          is_correct INTEGER NOT NULL,
          time_spent_seconds INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (report_id) REFERENCES diagnostic_reports(id) ON DELETE CASCADE
        );
      `);

      // Indexes for fast querying
      await this.run(`CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON diagnostic_reports(timestamp DESC);`);
      await this.run(`CREATE INDEX IF NOT EXISTS idx_reports_student ON diagnostic_reports(student_name);`);
      await this.run(`CREATE INDEX IF NOT EXISTS idx_sessions_status ON quiz_sessions(status);`);

      log.info('SQLite relational schema initialized with WAL mode and indexes');
    } catch (err) {
      log.error('Failed to initialize database tables', err);
    }
  }

  private async insertReportInternal(report: DiagnosticReport, sessionId?: string): Promise<void> {
    await this.run(
      `INSERT OR REPLACE INTO diagnostic_reports (
        id, session_id, student_name, quiz_title, timestamp,
        total_questions, correct_count, raw_accuracy,
        scaled_ability_theta, scaled_ability_score, total_score_points,
        max_streak, total_time_spent_seconds, report_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        report.id,
        sessionId || null,
        report.studentName,
        report.quizTitle,
        report.timestamp,
        report.totalQuestions,
        report.correctCount,
        report.rawAccuracy,
        report.scaledAbilityTheta,
        report.scaledAbilityScore,
        report.totalScorePoints,
        report.maxStreak,
        report.totalTimeSpentSeconds,
        JSON.stringify(report)
      ]
    );

    if (sessionId) {
      await this.run(
        `UPDATE quiz_sessions SET status = 'COMPLETED', updated_at = ? WHERE id = ?`,
        [new Date().toISOString(), sessionId]
      );
    }
  }

  private async migrateLegacyHistory(): Promise<void> {
    try {
      if (fs.existsSync(LEGACY_HISTORY_PATH)) {
        const raw = fs.readFileSync(LEGACY_HISTORY_PATH, 'utf-8');
        const legacyList: DiagnosticReport[] = JSON.parse(raw);
        if (Array.isArray(legacyList) && legacyList.length > 0) {
          const count = await this.get<{ count: number }>('SELECT COUNT(*) as count FROM diagnostic_reports');
          if (count && count.count === 0) {
            log.info(`Migrating ${legacyList.length} legacy history records to SQLite...`);
            for (const report of legacyList) {
              await this.insertReportInternal(report);
            }
            log.info('Legacy history migration complete.');
          }
        }
      }
    } catch (err) {
      log.warn('Could not migrate legacy history.json', { err });
    }
  }

  // Session lifecycle management
  public async createSession(
    id: string,
    studentName: string,
    mode: string,
    domain: string | undefined,
    totalQuestions: number
  ): Promise<void> {
    return this.enqueueWrite(async () => {
      const now = new Date().toISOString();
      await this.run(
        `INSERT INTO quiz_sessions (id, student_name, mode, domain, total_questions, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
        [id, studentName, mode, domain || null, totalQuestions, now, now]
      );
    });
  }

  public async updateSessionProgress(id: string, currentQuestionIndex: number): Promise<void> {
    return this.enqueueWrite(async () => {
      const now = new Date().toISOString();
      await this.run(
        `UPDATE quiz_sessions SET current_question_index = ?, updated_at = ? WHERE id = ?`,
        [currentQuestionIndex, now, id]
      );
    });
  }

  public async terminateSession(id: string, status: 'COMPLETED' | 'ABANDONED'): Promise<boolean> {
    return this.enqueueWrite(async () => {
      const now = new Date().toISOString();
      const res = await this.run(
        `UPDATE quiz_sessions SET status = ?, updated_at = ? WHERE id = ?`,
        [status, now, id]
      );
      return res.changes > 0;
    });
  }

  // Diagnostic Report Persistence with relational storage and answer audit trail
  public async saveDiagnosticReport(report: DiagnosticReport, sessionId?: string): Promise<void> {
    return this.enqueueWrite(async () => {
      await this.insertReportInternal(report, sessionId);
      log.info('Diagnostic report saved to SQLite successfully', { reportId: report.id });
    });
  }

  public async getRecentReports(limit: number = 50): Promise<DiagnosticReport[]> {
    await this.readyPromise;
    const rows = await this.all<{ report_json: string }>(
      `SELECT report_json FROM diagnostic_reports ORDER BY timestamp DESC LIMIT ?`,
      [limit]
    );
    return rows.map(r => JSON.parse(r.report_json) as DiagnosticReport);
  }

  public async getReportById(id: string): Promise<DiagnosticReport | null> {
    await this.readyPromise;
    const row = await this.get<{ report_json: string }>(
      `SELECT report_json FROM diagnostic_reports WHERE id = ?`,
      [id]
    );
    return row ? (JSON.parse(row.report_json) as DiagnosticReport) : null;
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

export const dbService = new DatabaseService();
