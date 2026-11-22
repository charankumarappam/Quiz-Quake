import { 
  Difficulty, 
  CoreTopic, 
  Question, 
  QuizAnswer, 
  TopicDiagnostic, 
  DiagnosticReport, 
  SubtopicMastery, 
  CohortPoint 
} from '../../shared/types';
import { IRTEngine, IRTResponse } from './irtEngine';
import questionsData from './data/questions.json';

const ALL_QUESTIONS: Question[] = questionsData as Question[];

export const CORE_TOPICS: CoreTopic[] = [
  'Operating Systems',
  'Data Structures',
  'Algorithms',
  'Computer Networks'
];

/**
 * Generic Domain-Agnostic Question Interface
 * Allows the adaptive engine to be reused across any discipline (Medicine, Law, Math, Language, etc.)
 */
export interface BaseAdaptiveQuestion<TTopic extends string = string> {
  id: string;
  topic: TTopic;
  subtopic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  conceptSummary: string;
  timeTargetSeconds: number;
  irtA?: number; // Optional Item Discrimination
  irtB?: number; // Optional Item Difficulty
  irtC?: number; // Optional Item Guessing
}

export interface NextQuestionResult<TQuestion = Question> {
  nextQuestion: TQuestion | null;
  newDifficulty: Difficulty;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  streak: number;
  maxStreak: number;
  transitionReason?: string;
  isFinished: boolean;
}

export interface AdaptiveEngineConfig<TTopic extends string = string> {
  topics: TTopic[];
  escalationThreshold?: number; // Number of consecutive correct to ascend tier (default: 2)
  demotionThreshold?: number;   // Number of incorrect to descend tier (default: 1)
  initialDifficulty?: Difficulty;
}

/**
 * Decoupled, Generic Adaptive Assessment Engine
 * Reusable for any question schema, custom topic lists, and configurable transition policies.
 */
export class GenericAdaptiveEngine<
  TTopic extends string = string,
  TQuestion extends BaseAdaptiveQuestion<TTopic> = BaseAdaptiveQuestion<TTopic>
> {
  private questions: TQuestion[];
  private topics: TTopic[];
  private escalationThreshold: number;
  private demotionThreshold: number;

  constructor(questions: TQuestion[], config: AdaptiveEngineConfig<TTopic>) {
    this.questions = questions;
    this.topics = config.topics;
    this.escalationThreshold = config.escalationThreshold ?? 2;
    this.demotionThreshold = config.demotionThreshold ?? 1;
  }

  public calculateNextTier(
    currentDifficulty: Difficulty,
    lastAnswerCorrect: boolean,
    currentConsecutiveCorrect: number,
    currentConsecutiveIncorrect: number,
    currentStreak: number,
    maxStreak: number
  ) {
    let newDifficulty = currentDifficulty;
    let nextConsecutiveCorrect = lastAnswerCorrect ? currentConsecutiveCorrect + 1 : 0;
    let nextConsecutiveIncorrect = !lastAnswerCorrect ? currentConsecutiveIncorrect + 1 : 0;
    let streak = lastAnswerCorrect ? currentStreak + 1 : 0;
    let newMaxStreak = Math.max(maxStreak, streak);
    let transitionReason: string | undefined;

    if (lastAnswerCorrect) {
      if (currentDifficulty === 'Easy') {
        if (nextConsecutiveCorrect >= this.escalationThreshold) {
          newDifficulty = 'Medium';
          nextConsecutiveCorrect = 0;
          transitionReason = `Elevated to Medium after ${this.escalationThreshold} consecutive correct answers.`;
        }
      } else if (currentDifficulty === 'Medium') {
        if (nextConsecutiveCorrect >= this.escalationThreshold) {
          newDifficulty = 'Hard';
          nextConsecutiveCorrect = 0;
          transitionReason = `Escalated to Hard after ${this.escalationThreshold} consecutive correct answers! High stakes activated.`;
        }
      } else if (currentDifficulty === 'Hard') {
        transitionReason = 'Mastery maintained in Hard tier. Streak bonus awarded!';
      }
    } else {
      if (currentDifficulty === 'Hard') {
        newDifficulty = 'Medium';
        nextConsecutiveCorrect = 0;
        transitionReason = 'Descended to Medium after incorrect answer on Hard.';
      } else if (currentDifficulty === 'Medium') {
        newDifficulty = 'Easy';
        nextConsecutiveCorrect = 0;
        transitionReason = 'Descended to Easy after incorrect answer on Medium.';
      } else {
        transitionReason = 'Remains in Easy tier. Review foundational concepts.';
      }
    }

    return {
      newDifficulty,
      consecutiveCorrect: nextConsecutiveCorrect,
      consecutiveIncorrect: nextConsecutiveIncorrect,
      streak,
      newMaxStreak,
      transitionReason
    };
  }

  public selectAdaptiveQuestion(
    targetDifficulty: Difficulty,
    visitedQuestionIds: string[],
    chosenDomain?: TTopic,
    topicRoundRobinIndex: number = 0
  ): { question: TQuestion | null; nextTopicIndex: number } {
    const available = this.questions.filter(q => !visitedQuestionIds.includes(q.id));

    if (available.length === 0) {
      return { question: null, nextTopicIndex: topicRoundRobinIndex };
    }

    if (chosenDomain) {
      const domainQuestions = available.filter(q => q.topic === chosenDomain);
      const exactTier = domainQuestions.filter(q => q.difficulty === targetDifficulty);
      if (exactTier.length > 0) {
        return { question: exactTier[0], nextTopicIndex: topicRoundRobinIndex };
      }
      if (domainQuestions.length > 0) {
        return { question: domainQuestions[0], nextTopicIndex: topicRoundRobinIndex };
      }
    }

    if (this.topics.length > 0) {
      const topicsToTry = this.topics.map((_, idx) => this.topics[(topicRoundRobinIndex + idx) % this.topics.length]);

      for (const topic of topicsToTry) {
        const pool = available.filter(q => q.topic === topic && q.difficulty === targetDifficulty);
        if (pool.length > 0) {
          const nextIndex = (topicRoundRobinIndex + 1) % this.topics.length;
          return { question: pool[0], nextTopicIndex: nextIndex };
        }
      }
    }

    const anyTier = available.filter(q => q.difficulty === targetDifficulty);
    if (anyTier.length > 0) {
      const nextIndex = this.topics.length > 0 ? (topicRoundRobinIndex + 1) % this.topics.length : 0;
      return { question: anyTier[0], nextTopicIndex: nextIndex };
    }

    const nextIndex = this.topics.length > 0 ? (topicRoundRobinIndex + 1) % this.topics.length : 0;
    return { question: available[0], nextTopicIndex: nextIndex };
  }
}

// Instantiate default CS Engine
export const defaultCSEngine = new GenericAdaptiveEngine<CoreTopic, Question>(
  ALL_QUESTIONS,
  { topics: CORE_TOPICS, escalationThreshold: 2, demotionThreshold: 1 }
);

/**
 * Backward-compatible helper functions delegating to generic engine
 */
export function calculateNextTier(
  currentDifficulty: Difficulty,
  lastAnswerCorrect: boolean,
  currentConsecutiveCorrect: number,
  currentConsecutiveIncorrect: number,
  currentStreak: number,
  maxStreak: number
) {
  return defaultCSEngine.calculateNextTier(
    currentDifficulty,
    lastAnswerCorrect,
    currentConsecutiveCorrect,
    currentConsecutiveIncorrect,
    currentStreak,
    maxStreak
  );
}

export function selectAdaptiveQuestion(
  targetDifficulty: Difficulty,
  visitedQuestionIds: string[],
  chosenDomain?: CoreTopic,
  topicRoundRobinIndex: number = 0
) {
  return defaultCSEngine.selectAdaptiveQuestion(
    targetDifficulty,
    visitedQuestionIds,
    chosenDomain,
    topicRoundRobinIndex
  );
}

/**
 * Diagnostic Report & Weak-Topic Calculation Engine
 * Integrates both Heuristic Scoring and True 2PL/3PL Bayesian EAP Item Response Theory Estimation
 */
export function generateDiagnosticReport(
  answers: QuizAnswer[],
  studentName: string = 'Learner',
  quizTitle: string = 'Computerized Adaptive Assessment'
): DiagnosticReport {
  const totalQuestions = answers.length;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const rawAccuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  let totalScorePoints = 0;
  let maxStreak = 0;
  let currentStreak = 0;
  let totalTimeSpentSeconds = 0;

  const difficultyBreakdown = {
    Easy: { attempted: 0, correct: 0 },
    Medium: { attempted: 0, correct: 0 },
    Hard: { attempted: 0, correct: 0 }
  };

  answers.forEach(a => {
    totalTimeSpentSeconds += a.timeSpentSeconds;
    difficultyBreakdown[a.difficulty].attempted++;
    if (a.isCorrect) {
      difficultyBreakdown[a.difficulty].correct++;
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;

      const basePoints = a.difficulty === 'Easy' ? 100 : a.difficulty === 'Medium' ? 200 : 350;
      const multiplier = a.difficulty === 'Hard' ? (1 + currentStreak * 0.3) : (1 + currentStreak * 0.15);
      totalScorePoints += Math.round(basePoints * multiplier);
    } else {
      currentStreak = 0;
    }
  });

  // Calculate Mathematical 3PL Bayesian EAP IRT Ability
  const irtResponses: IRTResponse[] = answers.map(a => ({
    itemId: a.questionId,
    isCorrect: a.isCorrect,
    params: IRTEngine.difficultyToIRTParams(a.difficulty, a.questionId)
  }));
  const irtResult = IRTEngine.estimateAbilityEAP(irtResponses);

  // Scaled Ability Theta & Score (hybrid integration of EAP and Heuristic)
  const scaledAbilityTheta = irtResult.theta;
  const scaledAbilityScore = Math.min(100, Math.max(0, Math.round(((scaledAbilityTheta + 3.0) / 6.0) * 100)));

  // Topic diagnostics
  const topicMap: Record<CoreTopic, {
    total: number;
    correct: number;
    subtopics: Record<string, { total: number; correct: number }>;
  }> = {
    'Operating Systems': { total: 0, correct: 0, subtopics: {} },
    'Data Structures': { total: 0, correct: 0, subtopics: {} },
    'Algorithms': { total: 0, correct: 0, subtopics: {} },
    'Computer Networks': { total: 0, correct: 0, subtopics: {} }
  };

  answers.forEach(a => {
    const t = a.topic;
    if (!topicMap[t]) return;
    topicMap[t].total++;
    if (a.isCorrect) topicMap[t].correct++;

    if (!topicMap[t].subtopics[a.subtopic]) {
      topicMap[t].subtopics[a.subtopic] = { total: 0, correct: 0 };
    }
    topicMap[t].subtopics[a.subtopic].total++;
    if (a.isCorrect) topicMap[t].subtopics[a.subtopic].correct++;
  });

  const weakTopics: string[] = [];
  const weakSubtopics: string[] = [];

  const topicDiagnostics: TopicDiagnostic[] = CORE_TOPICS.map(topic => {
    const data = topicMap[topic];
    const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

    let status: 'Critical Deficit' | 'Moderate' | 'Proficient' | 'Mastered' = 'Moderate';
    if (data.total > 0) {
      if (acc < 50) {
        status = 'Critical Deficit';
        weakTopics.push(topic);
      } else if (acc < 75) {
        status = 'Moderate';
      } else if (acc < 90) {
        status = 'Proficient';
      } else {
        status = 'Mastered';
      }
    }

    const subtopics: SubtopicMastery[] = Object.keys(data.subtopics).map(subName => {
      const sub = data.subtopics[subName];
      const subAcc = sub.total > 0 ? Math.round((sub.correct / sub.total) * 100) : 0;
      let subStatus: 'Critical Deficit' | 'Needs Improvement' | 'Proficient' = 'Proficient';
      if (subAcc < 50) {
        subStatus = 'Critical Deficit';
        weakSubtopics.push(subName);
      } else if (subAcc < 75) {
        subStatus = 'Needs Improvement';
      }
      return {
        name: subName,
        total: sub.total,
        correct: sub.correct,
        accuracy: subAcc,
        status: subStatus
      };
    });

    return {
      topic,
      totalQuestions: data.total,
      correctQuestions: data.correct,
      accuracy: acc,
      status,
      subtopics,
      recommendation: getTopicRecommendation(topic, acc)
    };
  });

  // Calculate Cohort Comparison (Percentile curve from Bayesian IRT + Population)
  const cohortPercentile = irtResult.percentileRank;

  const distribution: CohortPoint[] = [
    { scoreBand: '0-20%', percentageStudents: 5 },
    { scoreBand: '21-40%', percentageStudents: 15 },
    { scoreBand: '41-60%', percentageStudents: 32 },
    { scoreBand: '61-80%', percentageStudents: 36 },
    { scoreBand: '81-100%', percentageStudents: 12 }
  ];

  distribution.forEach(d => {
    const [low, high] = d.scoreBand.replace('%', '').split('-').map(Number);
    if (rawAccuracy >= low && rawAccuracy <= high) {
      d.isUserBand = true;
    }
  });

  const earnedBadges = [];
  if (correctCount === totalQuestions && totalQuestions >= 5) {
    earnedBadges.push({
      id: 'flawless',
      title: 'Flawless Victor',
      description: 'Answered 100% of questions correctly with zero faults.',
      icon: 'Crown'
    });
  }
  if (difficultyBreakdown.Hard.correct >= 2) {
    earnedBadges.push({
      id: 'hard_slayer',
      title: 'Apex Tier Mastery',
      description: 'Solved multiple high-stakes Hard difficulty problems.',
      icon: 'Flame'
    });
  }
  if (maxStreak >= 3) {
    earnedBadges.push({
      id: 'momentum',
      title: 'Unstoppable Momentum',
      description: `Built an unbroken adaptive streak of ${maxStreak} consecutive answers.`,
      icon: 'Zap'
    });
  }
  if (totalTimeSpentSeconds < totalQuestions * 35 && rawAccuracy >= 70) {
    earnedBadges.push({
      id: 'speed_demon',
      title: 'Cognitive Velocity',
      description: 'Completed the adaptive evaluation with elite speed and high precision.',
      icon: 'Clock'
    });
  }

  return {
    id: 'report_' + Date.now(),
    quizTitle,
    timestamp: new Date().toISOString(),
    studentName,
    totalQuestions,
    correctCount,
    rawAccuracy,
    scaledAbilityTheta,
    scaledAbilityScore,
    totalScorePoints,
    maxStreak,
    totalTimeSpentSeconds,
    averageTimePerQuestion: totalQuestions > 0 ? Math.round(totalTimeSpentSeconds / totalQuestions) : 0,
    difficultyBreakdown,
    topicDiagnostics,
    weakTopics: Array.from(new Set(weakTopics)),
    weakSubtopics: Array.from(new Set(weakSubtopics)),
    cohortPercentile,
    cohortComparison: {
      userScore: rawAccuracy,
      cohortMean: 63,
      topTenThreshold: 85,
      distribution
    },
    earnedBadges,
    answers
  };
}

function getTopicRecommendation(topic: CoreTopic, accuracy: number): string {
  if (accuracy < 50) {
    return `Priority revision required in ${topic}. Review underlying algorithmic definitions and edge conditions.`;
  }
  if (accuracy < 75) {
    return `Satisfactory grasp of ${topic}. Target complex subtopics to achieve mastery.`;
  }
  return `Strong proficiency in ${topic}. Ready for high-concurrency and advanced distributed system questions.`;
}

/**
 * Generates a 5-question remedial drill for weak topics
 */
export function generateRemedialDrill(weakTopics: string[], weakSubtopics: string[]): Question[] {
  let candidatePool = ALL_QUESTIONS.filter(q => 
    weakTopics.includes(q.topic) || weakSubtopics.includes(q.subtopic)
  );

  if (candidatePool.length === 0) {
    candidatePool = ALL_QUESTIONS;
  }

  const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}
