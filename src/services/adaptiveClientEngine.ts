import { 
  Difficulty, 
  CoreTopic, 
  Question, 
  QuizAnswer, 
  DiagnosticReport, 
  TopicDiagnostic,
  SubtopicMastery, 
  CohortPoint 
} from '../../shared/types';
import questionsData from '../../server/src/data/questions.json';

export const CLIENT_QUESTIONS: Question[] = questionsData as Question[];

export const CLIENT_TOPICS: CoreTopic[] = [
  'Operating Systems',
  'Data Structures',
  'Algorithms',
  'Computer Networks'
];

export function clientCalculateNextTier(
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
      if (nextConsecutiveCorrect >= 2) {
        newDifficulty = 'Medium';
        nextConsecutiveCorrect = 0;
        transitionReason = 'Elevated to Medium tier after 2 consecutive correct answers.';
      }
    } else if (currentDifficulty === 'Medium') {
      if (nextConsecutiveCorrect >= 2) {
        newDifficulty = 'Hard';
        nextConsecutiveCorrect = 0;
        transitionReason = 'Escalated to Hard tier! High stakes difficulty activated.';
      }
    } else if (currentDifficulty === 'Hard') {
      transitionReason = 'Mastery sustained in Hard tier. Streak bonus awarded!';
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

export function clientSelectQuestion(
  targetDifficulty: Difficulty,
  visitedQuestionIds: string[],
  chosenDomain?: CoreTopic,
  topicRoundRobinIndex: number = 0
): { question: Question | null; nextTopicIndex: number } {
  const available = CLIENT_QUESTIONS.filter(q => !visitedQuestionIds.includes(q.id));

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

  const topicsToTry = [
    CLIENT_TOPICS[topicRoundRobinIndex % CLIENT_TOPICS.length],
    CLIENT_TOPICS[(topicRoundRobinIndex + 1) % CLIENT_TOPICS.length],
    CLIENT_TOPICS[(topicRoundRobinIndex + 2) % CLIENT_TOPICS.length],
    CLIENT_TOPICS[(topicRoundRobinIndex + 3) % CLIENT_TOPICS.length]
  ];

  for (const topic of topicsToTry) {
    const pool = available.filter(q => q.topic === topic && q.difficulty === targetDifficulty);
    if (pool.length > 0) {
      const nextIndex = (topicRoundRobinIndex + 1) % CLIENT_TOPICS.length;
      return { question: pool[0], nextTopicIndex: nextIndex };
    }
  }

  const anyTier = available.filter(q => q.difficulty === targetDifficulty);
  if (anyTier.length > 0) {
    return { question: anyTier[0], nextTopicIndex: (topicRoundRobinIndex + 1) % CLIENT_TOPICS.length };
  }

  return { question: available[0], nextTopicIndex: (topicRoundRobinIndex + 1) % CLIENT_TOPICS.length };
}

export function clientGenerateDiagnosticReport(
  answers: QuizAnswer[],
  studentName: string = 'Learner',
  quizTitle: string = 'QuizQuake BrainStorm Arena'
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

  let weightedPoints = 0;
  let maxPossibleWeight = 0;
  answers.forEach(a => {
    const weight = a.difficulty === 'Easy' ? 1 : a.difficulty === 'Medium' ? 2 : 3.5;
    maxPossibleWeight += weight;
    if (a.isCorrect) weightedPoints += weight;
  });

  const abilityRatio = maxPossibleWeight > 0 ? weightedPoints / maxPossibleWeight : 0;
  const scaledAbilityTheta = Number(((abilityRatio * 5.0) - 2.5).toFixed(2));
  const scaledAbilityScore = Math.min(100, Math.round(abilityRatio * 100));

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

  const topicDiagnostics: TopicDiagnostic[] = CLIENT_TOPICS.map(topic => {
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

    const subtopicsList: SubtopicMastery[] = Object.entries(data.subtopics).map(([subName, subData]) => {
      const subAcc = Math.round((subData.correct / subData.total) * 100);
      let subStatus: 'Critical Deficit' | 'Needs Improvement' | 'Proficient' = 'Proficient';
      if (subAcc < 50) {
        subStatus = 'Critical Deficit';
        if (!weakSubtopics.includes(subName)) weakSubtopics.push(subName);
      } else if (subAcc < 75) {
        subStatus = 'Needs Improvement';
      }
      return {
        name: subName,
        total: subData.total,
        correct: subData.correct,
        accuracy: subAcc,
        status: subStatus
      };
    });

    let recommendation = `Solid mastery of core ${topic} principles.`;
    if (status === 'Critical Deficit') {
      recommendation = `High priority remediation needed in ${topic}. Review fundamental theoretical models and edge cases.`;
    } else if (status === 'Moderate') {
      recommendation = `Good baseline knowledge. Strengthen mastery of complex multi-step scenarios.`;
    }

    return {
      topic,
      totalQuestions: data.total,
      correctQuestions: data.correct,
      accuracy: acc,
      status,
      subtopics: subtopicsList,
      recommendation
    };
  });

  const zScore = (rawAccuracy - 63) / 14;
  let cohortPercentile = Math.round((0.5 * (1 + Math.tanh(zScore * 0.797885))) * 100);
  cohortPercentile = Math.max(5, Math.min(99, cohortPercentile));

  const distribution: CohortPoint[] = [
    { scoreBand: '0-20%', percentageStudents: 3 },
    { scoreBand: '21-40%', percentageStudents: 10 },
    { scoreBand: '41-60%', percentageStudents: 28 },
    { scoreBand: '61-80%', percentageStudents: 41 },
    { scoreBand: '81-100%', percentageStudents: 18 }
  ];

  if (rawAccuracy <= 20) distribution[0].isUserBand = true;
  else if (rawAccuracy <= 40) distribution[1].isUserBand = true;
  else if (rawAccuracy <= 60) distribution[2].isUserBand = true;
  else if (rawAccuracy <= 80) distribution[3].isUserBand = true;
  else distribution[4].isUserBand = true;

  const earnedBadges = [];
  if (maxStreak >= 3) {
    earnedBadges.push({
      id: 'streak_3',
      title: 'Blazing Streak 🔥',
      icon: 'flame',
      description: 'Sustained 3+ consecutive correct answers under adaptive pressure.'
    });
  }
  if (difficultyBreakdown.Hard.correct >= 1) {
    earnedBadges.push({
      id: 'hard_tier',
      title: 'Titan of Complexity ⚡',
      icon: 'zap',
      description: 'Successfully conquered Hard difficulty challenges.'
    });
  }
  if (rawAccuracy >= 80) {
    earnedBadges.push({
      id: 'top_performer',
      title: 'Master Strategist 🏆',
      icon: 'trophy',
      description: 'Achieved an elite accuracy score exceeding 80%.'
    });
  }
  if (earnedBadges.length === 0) {
    earnedBadges.push({
      id: 'resilient_scholar',
      title: 'Adaptive Challenger 🎯',
      icon: 'target',
      description: 'Completed computerized adaptive testing assessment.'
    });
  }

  const report: DiagnosticReport = {
    id: 'rep_' + Date.now(),
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
    weakTopics,
    weakSubtopics,
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

  // Save to client localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('quizquake_history') || '[]');
    existing.unshift(report);
    localStorage.setItem('quizquake_history', JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save report to localStorage', e);
  }

  return report;
}

export function clientGenerateRemedialDrill(
  weakTopics: string[],
  weakSubtopics: string[]
): Question[] {
  let drillQuestions: Question[] = [];

  if (weakSubtopics.length > 0) {
    drillQuestions = CLIENT_QUESTIONS.filter(q => weakSubtopics.includes(q.subtopic));
  }

  if (drillQuestions.length < 5 && weakTopics.length > 0) {
    const topicQuestions = CLIENT_QUESTIONS.filter(q => weakTopics.includes(q.topic) && !drillQuestions.some(d => d.id === q.id));
    drillQuestions = [...drillQuestions, ...topicQuestions];
  }

  if (drillQuestions.length < 5) {
    const remaining = CLIENT_QUESTIONS.filter(q => !drillQuestions.some(d => d.id === q.id));
    drillQuestions = [...drillQuestions, ...remaining];
  }

  return drillQuestions.slice(0, 5);
}
