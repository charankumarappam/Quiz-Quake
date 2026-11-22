import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errors';

export const StartQuizSchema = z.object({
  mode: z.enum(['comprehensive', 'domain']).default('comprehensive'),
  domain: z.enum([
    'Operating Systems',
    'Data Structures',
    'Algorithms',
    'Computer Networks'
  ]).optional(),
  totalQuestions: z.number().int().min(1).max(64).default(10),
  studentName: z.string().trim().min(1, 'Student name cannot be empty').max(100).default('Learner')
});

export const NextQuestionSchema = z.object({
  sessionId: z.string().optional(),
  currentDifficulty: z.enum(['Easy', 'Medium', 'Hard']),
  lastAnswerCorrect: z.boolean(),
  consecutiveCorrect: z.number().int().min(0),
  consecutiveIncorrect: z.number().int().min(0),
  currentStreak: z.number().int().min(0),
  maxStreak: z.number().int().min(0),
  visitedQuestionIds: z.array(z.string()).default([]),
  domain: z.enum([
    'Operating Systems',
    'Data Structures',
    'Algorithms',
    'Computer Networks'
  ]).optional(),
  topicRoundRobinIndex: z.number().int().min(0).default(0),
  currentQuestionIndex: z.number().int().min(1),
  totalQuestions: z.number().int().min(1).max(64).default(10),
  // Strict validation for answer index when client submits chosen answer
  selectedOption: z.number().int().min(0).max(3).optional()
});

export const QuizAnswerSchema = z.object({
  questionId: z.string().min(1),
  questionText: z.string().min(1),
  topic: z.enum([
    'Operating Systems',
    'Data Structures',
    'Algorithms',
    'Computer Networks'
  ]),
  subtopic: z.string().min(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  selectedOption: z.number().int().min(0).max(3),
  correctAnswer: z.number().int().min(0).max(3),
  isCorrect: z.boolean(),
  timeSpentSeconds: z.number().min(0),
  timeTargetSeconds: z.number().min(0),
  options: z.array(z.string()).min(2),
  explanation: z.string(),
  conceptSummary: z.string()
});

export const FinishQuizSchema = z.object({
  sessionId: z.string().optional(),
  answers: z.array(QuizAnswerSchema).min(1, 'At least one answer is required to generate a diagnostic report'),
  studentName: z.string().trim().min(1).max(100).default('Learner'),
  quizTitle: z.string().trim().min(1).max(200).default('QuizQuake BrainStorm Arena')
});

export const RemedialDrillSchema = z.object({
  weakTopics: z.array(z.string()).default([]),
  weakSubtopics: z.array(z.string()).default([])
});

export const TerminateSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  reason: z.enum(['USER_QUIT', 'TIMEOUT', 'PAGE_UNLOAD']).optional().default('USER_QUIT')
});

/**
 * Express Middleware factory for Zod Schema Validation
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message,
        code: i.code
      }));
      return next(new ValidationError('Invalid request payload', issues));
    }
    req.body = result.data;
    next();
  };
}
