export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type CoreTopic = 
  | 'Data Structures'
  | 'Algorithms'
  | 'Operating Systems'
  | 'Computer Networks';

export interface Question {
  id: string;
  topic: CoreTopic;
  subtopic: string;
  difficulty: Difficulty;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
  conceptSummary: string;
  timeTargetSeconds: number;
}

export interface QuizAnswer {
  questionId: string;
  questionText: string;
  topic: CoreTopic;
  subtopic: string;
  difficulty: Difficulty;
  selectedOption: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  timeTargetSeconds: number;
  options: string[];
  explanation: string;
  conceptSummary: string;
}

export interface AdaptiveTransition {
  fromTier: Difficulty;
  toTier: Difficulty;
  reason: string;
  streak: number;
}

export interface SubtopicMastery {
  name: string;
  total: number;
  correct: number;
  accuracy: number;
  status: 'Critical Deficit' | 'Needs Improvement' | 'Proficient';
}

export interface TopicDiagnostic {
  topic: CoreTopic;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number; // 0 - 100
  status: 'Critical Deficit' | 'Moderate' | 'Proficient' | 'Mastered';
  subtopics: SubtopicMastery[];
  recommendation: string;
}

export interface CohortPoint {
  scoreBand: string;
  percentageStudents: number;
  isUserBand?: boolean;
}

export interface DiagnosticReport {
  id: string;
  quizTitle: string;
  timestamp: string;
  studentName: string;
  totalQuestions: number;
  correctCount: number;
  rawAccuracy: number; // percentage
  scaledAbilityTheta: number; // IRT -3.0 to +3.0
  scaledAbilityScore: number; // 0 to 100
  totalScorePoints: number;
  maxStreak: number;
  totalTimeSpentSeconds: number;
  averageTimePerQuestion: number;
  difficultyBreakdown: {
    Easy: { attempted: number; correct: number };
    Medium: { attempted: number; correct: number };
    Hard: { attempted: number; correct: number };
  };
  topicDiagnostics: TopicDiagnostic[];
  weakTopics: string[];
  weakSubtopics: string[];
  cohortPercentile: number;
  cohortComparison: {
    userScore: number;
    cohortMean: number;
    topTenThreshold: number;
    distribution: CohortPoint[];
  };
  earnedBadges: {
    id: string;
    title: string;
    icon: string;
    description: string;
  }[];
  answers: QuizAnswer[];
}

export interface QuizConfig {
  mode: 'comprehensive' | 'domain';
  domain?: CoreTopic;
  totalQuestions: number;
  timeLimitSeconds: number;
  studentName: string;
}

export interface QuizSessionState {
  config: QuizConfig;
  currentQuestionIndex: number;
  currentDifficulty: Difficulty;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  currentStreak: number;
  maxStreak: number;
  scorePoints: number;
  remainingTimeSeconds: number;
  answeredQuestions: QuizAnswer[];
  activeQuestion: Question | null;
  roundRobinTopicIndex: number;
  visitedQuestionIds: string[];
  status: 'idle' | 'active' | 'completed';
  lastTransition?: AdaptiveTransition;
}
