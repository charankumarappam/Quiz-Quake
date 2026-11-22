import React, { useState, useEffect, useRef } from 'react';
import {
  QuizConfig,
  Difficulty,
  Question,
  QuizAnswer,
  DiagnosticReport,
  QuizSessionState,
  AdaptiveTransition
} from '../shared/types';
import { QuizApi } from './services/api';
import { Navbar } from './components/Navbar';
import { QuizSetup } from './components/QuizSetup';
import { QuestionCard } from './components/QuestionCard';
import { DifficultyBadge } from './components/DifficultyBadge';
import { TimerEngine } from './components/TimerEngine';
import { StreakMultiplier } from './components/StreakMultiplier';
import { DiagnosticReportView } from './components/DiagnosticReportView';
import { AttemptHistoryModal } from './components/AttemptHistoryModal';
import { QuestionBankModal } from './components/QuestionBankModal';
import { AlertCircle, RotateCcw } from 'lucide-react';

const SESSION_STORAGE_KEY = 'quizquake_active_session_state';

export const App: React.FC = () => {
  // Navigation / Views
  const [view, setView] = useState<'setup' | 'quiz' | 'report'>('setup');

  // Quiz Active State
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(1);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Medium');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [consecutiveIncorrect, setConsecutiveIncorrect] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [scorePoints, setScorePoints] = useState<number>(0);
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState<number>(600);
  const [answeredQuestions, setAnsweredQuestions] = useState<QuizAnswer[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [roundRobinTopicIndex, setRoundRobinTopicIndex] = useState<number>(0);
  const [visitedQuestionIds, setVisitedQuestionIds] = useState<string[]>([]);
  const [lastTransition, setLastTransition] = useState<AdaptiveTransition | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Completed Diagnostic Report
  const [report, setReport] = useState<DiagnosticReport | null>(null);

  // Modals
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isQuestionBankModalOpen, setIsQuestionBankModalOpen] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<DiagnosticReport[]>([]);

  // Guided demo notice
  const [guidedDemoStep, setGuidedDemoStep] = useState<number | null>(null);

  // Load history on mount
  useEffect(() => {
    QuizApi.getHistory().then(res => setHistoryList(res));
  }, []);

  // Restore active session on page reload (Brief Key Challenge: Managing page refresh)
  useEffect(() => {
    try {
      const savedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const parsed: QuizSessionState = JSON.parse(savedSession);
        if (parsed.status === 'active' && parsed.activeQuestion) {
          setQuizConfig(parsed.config);
          setCurrentQuestionIndex(parsed.currentQuestionIndex);
          setCurrentDifficulty(parsed.currentDifficulty);
          setConsecutiveCorrect(parsed.consecutiveCorrect);
          setConsecutiveIncorrect(parsed.consecutiveIncorrect);
          setCurrentStreak(parsed.currentStreak);
          setMaxStreak(parsed.maxStreak);
          setScorePoints(parsed.scorePoints);
          setRemainingTimeSeconds(parsed.remainingTimeSeconds);
          setAnsweredQuestions(parsed.answeredQuestions);
          setActiveQuestion(parsed.activeQuestion);
          setRoundRobinTopicIndex(parsed.roundRobinTopicIndex);
          setVisitedQuestionIds(parsed.visitedQuestionIds);
          setLastTransition(parsed.lastTransition);
          setView('quiz');
        }
      }
    } catch (e) {
      console.warn('Could not restore session from storage', e);
    }
  }, []);

  // Helper to persist session
  const persistSession = (state: Partial<QuizSessionState>) => {
    try {
      if (!quizConfig || !activeQuestion) return;
      const fullState: QuizSessionState = {
        config: quizConfig,
        currentQuestionIndex,
        currentDifficulty,
        consecutiveCorrect,
        consecutiveIncorrect,
        currentStreak,
        maxStreak,
        scorePoints,
        remainingTimeSeconds,
        answeredQuestions,
        activeQuestion,
        roundRobinTopicIndex,
        visitedQuestionIds,
        status: 'active',
        lastTransition,
        ...state,
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fullState));
    } catch (e) {
      console.warn('Failed to save session state to sessionStorage', e);
    }
  };

  // Start new assessment
  const handleStartQuiz = async (config: QuizConfig) => {
    setIsSubmitting(true);
    try {
      const session = await QuizApi.startQuiz(config);
      setQuizConfig(config);
      setCurrentQuestionIndex(session.currentQuestionIndex);
      setCurrentDifficulty(session.currentDifficulty);
      setConsecutiveCorrect(session.consecutiveCorrect);
      setConsecutiveIncorrect(session.consecutiveIncorrect);
      setCurrentStreak(session.streak);
      setMaxStreak(session.maxStreak);
      setScorePoints(session.scorePoints);
      setRemainingTimeSeconds(config.timeLimitSeconds);
      setAnsweredQuestions([]);
      setActiveQuestion(session.question);
      setRoundRobinTopicIndex(session.nextTopicIndex);
      setVisitedQuestionIds(session.question ? [session.question.id] : []);
      setLastTransition(undefined);
      setGuidedDemoStep(null);
      setView('quiz');

      // Persist to session
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          config,
          currentQuestionIndex: session.currentQuestionIndex,
          currentDifficulty: session.currentDifficulty,
          consecutiveCorrect: 0,
          consecutiveIncorrect: 0,
          currentStreak: 0,
          maxStreak: 0,
          scorePoints: 0,
          remainingTimeSeconds: config.timeLimitSeconds,
          answeredQuestions: [],
          activeQuestion: session.question,
          roundRobinTopicIndex: session.nextTopicIndex,
          visitedQuestionIds: session.question ? [session.question.id] : [],
          status: 'active',
        })
      );
    } catch (err) {
      console.error('Failed to start quiz', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Process user answer
  const handleAnswerSubmit = async (selectedOption: number, timeSpentSeconds: number) => {
    if (!activeQuestion || !quizConfig || isSubmitting) return;

    setIsSubmitting(true);
    const isCorrect = selectedOption === activeQuestion.correctAnswer;

    // Record answer
    const currentAnswer: QuizAnswer = {
      questionId: activeQuestion.id,
      questionText: activeQuestion.question,
      topic: activeQuestion.topic,
      subtopic: activeQuestion.subtopic,
      difficulty: activeQuestion.difficulty,
      selectedOption,
      correctAnswer: activeQuestion.correctAnswer,
      isCorrect,
      timeSpentSeconds,
      timeTargetSeconds: activeQuestion.timeTargetSeconds,
      options: activeQuestion.options,
      explanation: activeQuestion.explanation,
      conceptSummary: activeQuestion.conceptSummary,
    };

    const updatedAnswers = [...answeredQuestions, currentAnswer];
    setAnsweredQuestions(updatedAnswers);

    // Calculate updated points & streak
    let newScorePoints = scorePoints;
    let newStreak = isCorrect ? currentStreak + 1 : 0;
    let newMaxStreak = Math.max(maxStreak, newStreak);

    if (isCorrect) {
      const basePoints = activeQuestion.difficulty === 'Easy' ? 100 : activeQuestion.difficulty === 'Medium' ? 200 : 350;
      const mult = activeQuestion.difficulty === 'Hard' ? (1 + newStreak * 0.3) : (1 + newStreak * 0.15);
      newScorePoints += Math.round(basePoints * mult);
    }
    setScorePoints(newScorePoints);

    // If guided demo is active, advance step
    if (guidedDemoStep !== null) {
      setGuidedDemoStep(prev => (prev !== null ? prev + 1 : null));
    }

    try {
      const response = await QuizApi.nextQuestion({
        currentDifficulty,
        lastAnswerCorrect: isCorrect,
        consecutiveCorrect,
        consecutiveIncorrect,
        currentStreak,
        maxStreak: newMaxStreak,
        visitedQuestionIds,
        domain: quizConfig.mode === 'domain' ? quizConfig.domain : undefined,
        topicRoundRobinIndex: roundRobinTopicIndex,
        currentQuestionIndex,
        totalQuestions: quizConfig.totalQuestions,
      });

      if (response.isFinished || !response.question) {
        // Quiz completed -> Generate Diagnostic Report!
        await handleFinishQuiz(updatedAnswers);
      } else {
        // Transition to next question
        const nextQ = response.question;
        const newVisited = [...visitedQuestionIds, nextQ.id];

        const transitionObj: AdaptiveTransition | undefined = response.transitionReason ? {
          fromTier: currentDifficulty,
          toTier: response.currentDifficulty,
          reason: response.transitionReason,
          streak: response.streak,
        } : undefined;

        setCurrentQuestionIndex(response.currentQuestionIndex);
        setCurrentDifficulty(response.currentDifficulty);
        setConsecutiveCorrect(response.consecutiveCorrect);
        setConsecutiveIncorrect(response.consecutiveIncorrect);
        setCurrentStreak(response.streak);
        setMaxStreak(response.maxStreak);
        setActiveQuestion(nextQ);
        setRoundRobinTopicIndex(response.nextTopicIndex);
        setVisitedQuestionIds(newVisited);
        setLastTransition(transitionObj);

        persistSession({
          currentQuestionIndex: response.currentQuestionIndex,
          currentDifficulty: response.currentDifficulty,
          consecutiveCorrect: response.consecutiveCorrect,
          consecutiveIncorrect: response.consecutiveIncorrect,
          currentStreak: response.streak,
          maxStreak: response.maxStreak,
          scorePoints: newScorePoints,
          answeredQuestions: updatedAnswers,
          activeQuestion: nextQ,
          roundRobinTopicIndex: response.nextTopicIndex,
          visitedQuestionIds: newVisited,
          lastTransition: transitionObj,
        });
      }
    } catch (err) {
      console.error('Failed to transition to next question', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete quiz and display diagnostic scorecard
  const handleFinishQuiz = async (answers: QuizAnswer[]) => {
    setIsSubmitting(true);
    try {
      const finalReport = await QuizApi.finishQuiz(
        answers,
        quizConfig?.studentName || 'Learner',
        quizConfig?.mode === 'domain' ? `${quizConfig.domain} Adaptive Assessment` : 'Comprehensive CS Adaptive Assessment'
      );
      setReport(finalReport);
      setView('report');
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      QuizApi.getHistory().then(res => setHistoryList(res));
    } catch (err) {
      console.error('Error generating diagnostic report', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Time expired handler
  const handleTimeExpired = () => {
    if (view === 'quiz') {
      handleFinishQuiz(answeredQuestions);
    }
  };

  // Reset to initial setup
  const handleResetToHome = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setView('setup');
    setReport(null);
    setGuidedDemoStep(null);
  };

  // Quick 1-Click Completed Demo Report from Hackathon Brief
  const handleInstantDemoReport = async () => {
    setIsSubmitting(true);
    try {
      const questions = await QuizApi.getAllQuestions();
      const osQuestions = questions.filter(q => q.topic === 'Operating Systems');
      const med1 = osQuestions.find(q => q.difficulty === 'Medium' && q.subtopic === 'Process Scheduling') || osQuestions[0];
      const med2 = osQuestions.find(q => q.difficulty === 'Medium' && q.subtopic === 'Virtual Memory & Paging') || osQuestions[1];
      const hardDeadlock = osQuestions.find(q => q.difficulty === 'Hard' && q.subtopic === 'Deadlock Avoidance') || osQuestions[2];
      const med3 = osQuestions.find(q => q.difficulty === 'Medium' && q.id !== med1.id && q.id !== med2.id) || osQuestions[3];

      const demoAnswers: QuizAnswer[] = [
        {
          questionId: med1.id,
          questionText: med1.question,
          topic: med1.topic,
          subtopic: med1.subtopic,
          difficulty: 'Medium',
          selectedOption: med1.correctAnswer,
          correctAnswer: med1.correctAnswer,
          isCorrect: true,
          timeSpentSeconds: 42,
          timeTargetSeconds: 60,
          options: med1.options,
          explanation: med1.explanation,
          conceptSummary: med1.conceptSummary,
        },
        {
          questionId: med2.id,
          questionText: med2.question,
          topic: med2.topic,
          subtopic: med2.subtopic,
          difficulty: 'Medium',
          selectedOption: med2.correctAnswer,
          correctAnswer: med2.correctAnswer,
          isCorrect: true,
          timeSpentSeconds: 49,
          timeTargetSeconds: 60,
          options: med2.options,
          explanation: med2.explanation,
          conceptSummary: med2.conceptSummary,
        },
        {
          questionId: hardDeadlock.id,
          questionText: hardDeadlock.question,
          topic: hardDeadlock.topic,
          subtopic: 'Deadlock Avoidance',
          difficulty: 'Hard',
          selectedOption: (hardDeadlock.correctAnswer + 1) % 4, // incorrect
          correctAnswer: hardDeadlock.correctAnswer,
          isCorrect: false,
          timeSpentSeconds: 84,
          timeTargetSeconds: 90,
          options: hardDeadlock.options,
          explanation: hardDeadlock.explanation,
          conceptSummary: hardDeadlock.conceptSummary,
        },
        {
          questionId: med3.id,
          questionText: med3.question,
          topic: med3.topic,
          subtopic: med3.subtopic,
          difficulty: 'Medium',
          selectedOption: med3.correctAnswer,
          correctAnswer: med3.correctAnswer,
          isCorrect: true,
          timeSpentSeconds: 52,
          timeTargetSeconds: 60,
          options: med3.options,
          explanation: med3.explanation,
          conceptSummary: med3.conceptSummary,
        },
      ];

      const rep = await QuizApi.finishQuiz(
        demoAnswers,
        'Hackathon Evaluator',
        'Operating Systems Adaptive Evaluation (Brief Demo Scenario)'
      );
      setReport(rep);
      setView('report');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Launch guided demo test in Operating Systems
  const handleStartGuidedOSDemo = () => {
    setGuidedDemoStep(1);
    handleStartQuiz({
      mode: 'domain',
      domain: 'Operating Systems',
      totalQuestions: 5,
      timeLimitSeconds: 600,
      studentName: 'Demo Evaluator',
    });
  };

  const handleClearHistory = () => {
    localStorage.removeItem('quizquake_history');
    setHistoryList([]);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2B1D15] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Main Navbar */}
      <Navbar
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenQuestionBank={() => setIsQuestionBankModalOpen(true)}
        onResetToHome={handleResetToHome}
        isQuizActive={view === 'quiz'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-8">
        {/* VIEW 1: Quiz Setup / Dashboard */}
        {view === 'setup' && (
          <QuizSetup
            onStartQuiz={handleStartQuiz}
            onLaunchJudgeDemo={handleStartGuidedOSDemo}
          />
        )}

        {/* VIEW 2: Active Timed Adaptive Quiz Arena */}
        {view === 'quiz' && activeQuestion && quizConfig && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Guided Demo Guidance Banner if active */}
            {guidedDemoStep !== null && (
              <div className="p-4 rounded-2xl bg-[#EFE6DC] border border-[#DAC5B1] text-xs text-[#523B2B] flex items-start gap-3 shadow-md animate-fade-in">
                <AlertCircle className="w-5 h-5 text-[#8C5835] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-[#2A1C14] uppercase tracking-wider">
                    Guided Demo Sequence (Step {guidedDemoStep} of 3)
                  </span>
                  <p>
                    {guidedDemoStep === 1 && "Answer this Medium question correctly to begin your streak (1/2 to Hard)."}
                    {guidedDemoStep === 2 && "Answer this second Medium question correctly to trigger automatic escalation to 'Hard' difficulty!"}
                    {guidedDemoStep >= 3 && "Notice the badge escalated to HARD with a complex Deadlocks question! Select an incorrect answer to trigger descent to Medium and flag 'Deadlock Avoidance' as a weak topic on the final radar chart."}
                  </p>
                </div>
              </div>
            )}

            {/* Quiz Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#FFFDF9] border border-[#E5D7C7] shadow-xl shadow-[#4A3224]/5">
              {/* Difficulty Badge & Tier Ascend Tracker */}
              <DifficultyBadge
                difficulty={currentDifficulty}
                consecutiveCorrect={consecutiveCorrect}
                lastTransition={lastTransition}
              />

              <div className="flex flex-wrap items-center gap-3">
                {/* Streak Multiplier */}
                <StreakMultiplier
                  streak={currentStreak}
                  maxStreak={maxStreak}
                  scorePoints={scorePoints}
                  difficulty={currentDifficulty}
                />

                {/* Countdown Timer with Auto-Submission */}
                <TimerEngine
                  initialRemainingSeconds={remainingTimeSeconds}
                  onTimeExpired={handleTimeExpired}
                  onTick={(sec) => setRemainingTimeSeconds(sec)}
                />
              </div>
            </div>

            {/* Active Question Card */}
            <QuestionCard
              question={activeQuestion}
              questionIndex={currentQuestionIndex}
              totalQuestions={quizConfig.totalQuestions}
              onAnswerSubmit={handleAnswerSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* VIEW 3: Interactive Diagnostic Report & Radar Chart */}
        {view === 'report' && report && (
          <DiagnosticReportView
            report={report}
            onRetake={() => quizConfig && handleStartQuiz(quizConfig)}
            onNewQuiz={handleResetToHome}
          />
        )}
      </main>

      {/* History Modal */}
      <AttemptHistoryModal
        history={historyList}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectAttempt={(rep) => {
          setReport(rep);
          setView('report');
          setIsHistoryModalOpen(false);
        }}
        onClearHistory={handleClearHistory}
      />

      {/* Question Bank Modal */}
      <QuestionBankModal
        isOpen={isQuestionBankModalOpen}
        onClose={() => setIsQuestionBankModalOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-mono no-print">
        QuizQuake: BrainStorm Arena &bull; Computerized Adaptive Testing System &bull; 64 Verified Computer Science Items
      </footer>
    </div>
  );
};

export default App;
