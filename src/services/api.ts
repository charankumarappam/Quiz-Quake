import { 
  Difficulty, 
  CoreTopic, 
  Question, 
  QuizAnswer, 
  DiagnosticReport, 
  QuizConfig 
} from '../../shared/types';
import { 
  CLIENT_QUESTIONS, 
  CLIENT_TOPICS,
  clientCalculateNextTier, 
  clientSelectQuestion, 
  clientGenerateDiagnosticReport, 
  clientGenerateRemedialDrill 
} from './adaptiveClientEngine';

const API_BASE = '/api';

export const QuizApi = {
  // Start quiz session
  async startQuiz(config: QuizConfig) {
    try {
      const res = await fetch(`${API_BASE}/quiz/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend API unreachable, using client engine fallback', err);
    }

    // Fallback: Client Engine
    const initialDifficulty: Difficulty = 'Medium';
    const { question, nextTopicIndex } = clientSelectQuestion(
      initialDifficulty,
      [],
      config.mode === 'domain' ? config.domain : undefined,
      0
    );

    return {
      sessionId: 'client_session_' + Date.now(),
      studentName: config.studentName || 'Learner',
      mode: config.mode,
      domain: config.domain,
      totalQuestions: config.totalQuestions,
      currentQuestionIndex: 1,
      currentDifficulty: initialDifficulty,
      question,
      nextTopicIndex,
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0,
      streak: 0,
      maxStreak: 0,
      scorePoints: 0
    };
  },

  // Transition to next adaptive question
  async nextQuestion(payload: {
    currentDifficulty: Difficulty;
    lastAnswerCorrect: boolean;
    consecutiveCorrect: number;
    consecutiveIncorrect: number;
    currentStreak: number;
    maxStreak: number;
    visitedQuestionIds: string[];
    domain?: CoreTopic;
    topicRoundRobinIndex: number;
    currentQuestionIndex: number;
    totalQuestions: number;
  }) {
    try {
      const res = await fetch(`${API_BASE}/quiz/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend API unreachable, using client engine fallback', err);
    }

    // Fallback: Client Engine
    const scaling = clientCalculateNextTier(
      payload.currentDifficulty,
      payload.lastAnswerCorrect,
      payload.consecutiveCorrect,
      payload.consecutiveIncorrect,
      payload.currentStreak,
      payload.maxStreak
    );

    if (payload.currentQuestionIndex >= payload.totalQuestions) {
      return {
        isFinished: true,
        scaling
      };
    }

    const { question, nextTopicIndex } = clientSelectQuestion(
      scaling.newDifficulty,
      payload.visitedQuestionIds,
      payload.domain,
      payload.topicRoundRobinIndex
    );

    return {
      isFinished: false,
      currentQuestionIndex: payload.currentQuestionIndex + 1,
      currentDifficulty: scaling.newDifficulty,
      consecutiveCorrect: scaling.consecutiveCorrect,
      consecutiveIncorrect: scaling.consecutiveIncorrect,
      streak: scaling.streak,
      maxStreak: scaling.newMaxStreak,
      transitionReason: scaling.transitionReason,
      question,
      nextTopicIndex
    };
  },

  // Finish quiz and generate diagnostic report
  async finishQuiz(answers: QuizAnswer[], studentName: string, quizTitle: string): Promise<DiagnosticReport> {
    try {
      const res = await fetch(`${API_BASE}/quiz/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, studentName, quizTitle }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend API finish failed, using client engine', err);
    }

    return clientGenerateDiagnosticReport(answers, studentName, quizTitle);
  },

  // Generate 5-question remedial drill
  async getRemedialDrill(weakTopics: string[], weakSubtopics: string[]): Promise<Question[]> {
    try {
      const res = await fetch(`${API_BASE}/quiz/remedial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weakTopics, weakSubtopics }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.questions;
      }
    } catch (err) {
      console.warn('Backend API drill failed, using client engine', err);
    }

    return clientGenerateRemedialDrill(weakTopics, weakSubtopics);
  },

  // Get historical attempts
  async getHistory(): Promise<DiagnosticReport[]> {
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data;
      }
    } catch (err) {
      // fallback to localStorage
    }

    try {
      const local = localStorage.getItem('quizquake_history');
      if (local) return JSON.parse(local);
    } catch (e) {
      // ignore
    }
    return [];
  },

  // Browse all questions
  async getAllQuestions(): Promise<Question[]> {
    try {
      const res = await fetch(`${API_BASE}/questions`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // fallback
    }
    return CLIENT_QUESTIONS;
  }
};
