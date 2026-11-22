import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { 
  Difficulty, 
  Question, 
  QuizAnswer 
} from '../../shared/types';
import { 
  CORE_TOPICS, 
  calculateNextTier, 
  selectAdaptiveQuestion, 
  generateDiagnosticReport, 
  generateRemedialDrill 
} from './adaptiveEngine';
import { IRTEngine } from './irtEngine';
import { dbService } from './db';
import { logger } from './logger';
import { AppError, NotFoundError } from './errors';
import { 
  StartQuizSchema, 
  NextQuestionSchema, 
  FinishQuizSchema, 
  RemedialDrillSchema, 
  TerminateSessionSchema,
  validateBody 
} from './validators';
import questionsData from './data/questions.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const log = logger.forModule('Server');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Correlation ID & Request Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  res.setHeader('X-Request-Id', correlationId);
  (req as any).correlationId = correlationId;

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    log.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration
    }, correlationId);
  });
  next();
});

const ALL_QUESTIONS: Question[] = questionsData as Question[];

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    name: 'QuizQuake BrainStorm Arena Server', 
    database: 'SQLite (Relational, WAL mode, ACID compliant)',
    questionsCount: ALL_QUESTIONS.length,
    topics: CORE_TOPICS,
    irtModelsSupported: ['1PL', '2PL', '3PL', 'Bayesian EAP', 'Fisher Information']
  });
});

// Topics Metadata API
app.get('/api/topics', (req: Request, res: Response) => {
  const summary = CORE_TOPICS.map(topic => {
    const qList = ALL_QUESTIONS.filter(q => q.topic === topic);
    return {
      topic,
      total: qList.length,
      easy: qList.filter(q => q.difficulty === 'Easy').length,
      medium: qList.filter(q => q.difficulty === 'Medium').length,
      hard: qList.filter(q => q.difficulty === 'Hard').length,
      subtopics: Array.from(new Set(qList.map(q => q.subtopic)))
    };
  });
  res.json(summary);
});

// Start Adaptive Quiz Session (With Zod Validation & Relational Session Tracking)
app.post('/api/quiz/start', validateBody(StartQuizSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mode, domain, totalQuestions, studentName } = req.body;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Track active session in SQLite relational store
    await dbService.createSession(sessionId, studentName, mode, domain, totalQuestions);

    const initialDifficulty: Difficulty = 'Medium';
    const { question, nextTopicIndex } = selectAdaptiveQuestion(
      initialDifficulty, 
      [], 
      mode === 'domain' ? domain : undefined, 
      0
    );

    res.json({
      sessionId,
      studentName,
      mode,
      domain,
      totalQuestions,
      currentQuestionIndex: 1,
      currentDifficulty: initialDifficulty,
      question,
      nextTopicIndex,
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0,
      streak: 0,
      maxStreak: 0,
      scorePoints: 0
    });
  } catch (err) {
    next(err);
  }
});

// Process Answer & Transition Tier (With Zod Validation & Answer Bounds Verification)
app.post('/api/quiz/next', validateBody(NextQuestionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      sessionId,
      currentDifficulty,
      lastAnswerCorrect,
      consecutiveCorrect,
      consecutiveIncorrect,
      currentStreak,
      maxStreak,
      visitedQuestionIds,
      domain,
      topicRoundRobinIndex,
      currentQuestionIndex,
      totalQuestions
    } = req.body;

    // Update active session progress
    if (sessionId) {
      await dbService.updateSessionProgress(sessionId, currentQuestionIndex + 1);
    }

    // 1. Calculate difficulty scaling via deterministic state machine
    const scaling = calculateNextTier(
      currentDifficulty,
      lastAnswerCorrect,
      consecutiveCorrect,
      consecutiveIncorrect,
      currentStreak,
      maxStreak
    );

    // Check if test reached terminal question
    if (currentQuestionIndex >= totalQuestions) {
      return res.json({
        isFinished: true,
        scaling
      });
    }

    // 2. Select next adaptive question respecting tier and round-robin topic
    const { question, nextTopicIndex } = selectAdaptiveQuestion(
      scaling.newDifficulty,
      visitedQuestionIds,
      domain,
      topicRoundRobinIndex
    );

    res.json({
      isFinished: false,
      currentQuestionIndex: currentQuestionIndex + 1,
      currentDifficulty: scaling.newDifficulty,
      consecutiveCorrect: scaling.consecutiveCorrect,
      consecutiveIncorrect: scaling.consecutiveIncorrect,
      streak: scaling.streak,
      maxStreak: scaling.newMaxStreak,
      transitionReason: scaling.transitionReason,
      question,
      nextTopicIndex
    });
  } catch (err) {
    next(err);
  }
});

// Handle Rapid Session Termination / Abandonment Edge Case
app.post('/api/quiz/abandon', validateBody(TerminateSessionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, reason } = req.body;
    const terminated = await dbService.terminateSession(sessionId, 'ABANDONED');
    log.info('Session abandoned / terminated', { sessionId, reason, found: terminated });
    res.json({ success: true, sessionId, status: 'ABANDONED', reason });
  } catch (err) {
    next(err);
  }
});

// Complete Quiz & Produce Calibrated Diagnostic Report (Stored in SQLite)
app.post('/api/quiz/finish', validateBody(FinishQuizSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, answers, studentName, quizTitle } = req.body;

    // Generate hybrid Heuristic + 3PL Bayesian EAP report
    const report = generateDiagnosticReport(answers as QuizAnswer[], studentName, quizTitle);

    // Save report atomically into SQLite database
    await dbService.saveDiagnosticReport(report, sessionId);

    res.json(report);
  } catch (err) {
    next(err);
  }
});

// 5-Question Remedial Drill Generator
app.post('/api/quiz/remedial', validateBody(RemedialDrillSchema), (req: Request, res: Response) => {
  const { weakTopics, weakSubtopics } = req.body;
  const drillQuestions = generateRemedialDrill(weakTopics, weakSubtopics);
  res.json({
    totalQuestions: drillQuestions.length,
    questions: drillQuestions
  });
});

// Attempt History API (Relational SQLite Read)
app.get('/api/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const history = await dbService.getRecentReports(limit);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

// Single Report by ID API
app.get('/api/history/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await dbService.getReportById(req.params.id);
    if (!report) {
      throw new NotFoundError(`Diagnostic report ${req.params.id} not found`);
    }
    res.json(report);
  } catch (err) {
    next(err);
  }
});

// Question Bank API with filters
app.get('/api/questions', (req: Request, res: Response) => {
  const { topic, difficulty, search } = req.query;
  let filtered = ALL_QUESTIONS;

  if (topic) {
    filtered = filtered.filter(q => q.topic === topic);
  }
  if (difficulty) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  if (search && typeof search === 'string') {
    const qLower = search.toLowerCase();
    filtered = filtered.filter(q => 
      q.question.toLowerCase().includes(qLower) || 
      q.subtopic.toLowerCase().includes(qLower)
    );
  }

  res.json(filtered);
});

// Serve frontend build in production
const distPath = path.join(__dirname, '..', '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Centralized Express Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req as any).correlationId;
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  log.error(`API Error: ${message}`, err, {
    url: req.originalUrl,
    statusCode,
    details: isAppError ? err.details : undefined
  }, correlationId);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      details: isAppError ? err.details : undefined,
      correlationId
    }
  });
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    log.info(`QuizQuake BrainStorm Arena Server running on http://localhost:${PORT}`);
  });
}

export default app;
