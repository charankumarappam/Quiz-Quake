import React, { useState } from 'react';
import { DiagnosticReport, Question } from '../../shared/types';
import { WeakTopicRadarChart } from './RadarChart';
import { CohortBenchmark } from './CohortBenchmark';
import { SolutionReview } from './SolutionReview';
import { RemedialQuizModal } from './RemedialQuizModal';
import { QuizApi } from '../services/api';
import { 
  Trophy, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  RotateCcw, 
  Zap, 
  Award, 
  Flame, 
  Clock, 
  BookOpen, 
  Printer, 
  Layers 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiagnosticReportViewProps {
  report: DiagnosticReport;
  onRetake: () => void;
  onNewQuiz: () => void;
}

export const DiagnosticReportView: React.FC<DiagnosticReportViewProps> = ({
  report,
  onRetake,
  onNewQuiz,
}) => {
  const [remedialModalOpen, setRemedialModalOpen] = useState<boolean>(false);
  const [remedialQuestions, setRemedialQuestions] = useState<Question[]>([]);
  const [isLoadingDrill, setIsLoadingDrill] = useState<boolean>(false);

  // Trigger celebratory confetti on high accuracy
  React.useEffect(() => {
    if (report.rawAccuracy >= 70) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [report.rawAccuracy]);

  const handleLaunchRemedialDrill = async () => {
    setIsLoadingDrill(true);
    try {
      const drill = await QuizApi.getRemedialDrill(report.weakTopics, report.weakSubtopics);
      setRemedialQuestions(drill);
      setRemedialModalOpen(true);
    } catch (err) {
      console.error('Error fetching remedial drill', err);
    } finally {
      setIsLoadingDrill(false);
    }
  };

  const handleExportPDF = () => {
    // Uses standard window.print formatted with print media stylesheet
    window.print();
  };

  const criticalDeficitTopics = report.topicDiagnostics.filter(t => t.status === 'Critical Deficit');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#FFFDF9] border border-[#E5D7C7] shadow-xl shadow-[#4A3224]/5 no-print">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#7B4622] font-bold">
            Evaluation Report #{report.id.slice(-6)}
          </span>
          <h2 className="text-2xl font-extrabold text-[#251710] mt-0.5">
            Weak-Topic Diagnostic Scorecard
          </h2>
          <p className="text-xs text-[#7A6455]">
            Candidate: <span className="text-[#251710] font-semibold">{report.studentName}</span> &bull; {new Date(report.timestamp).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F2E7DC] hover:bg-[#E8DACB] text-[#3D281C] text-xs font-bold transition-colors border border-[#DAC6B4] shadow-sm"
            title="Export Diagnostic Scorecard for Faculty Review"
          >
            <Printer className="w-4 h-4 text-[#7B4622]" />
            <span>Print / PDF Export</span>
          </button>

          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F2E7DC] hover:bg-[#E8DACB] text-[#3D281C] text-xs font-bold transition-colors border border-[#DAC6B4] shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-[#2E7D32]" />
            <span>Retake Adaptive Quiz</span>
          </button>

          <button
            onClick={onNewQuiz}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A2E1D] to-[#6E4226] hover:from-[#3B2416] hover:to-[#5A351E] text-[#FFFDF9] text-xs font-bold transition-all shadow-md shadow-[#4A2E1D]/20"
          >
            <Target className="w-4 h-4" />
            <span>New Assessment</span>
          </button>
        </div>
      </div>

      {/* Hero Performance Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Raw Accuracy */}
        <div className="bg-[#FFFDF9] border border-[#E5D7C7] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A6455] text-xs uppercase font-mono font-semibold">
            <span>Accuracy Rate</span>
            <Target className="w-4 h-4 text-[#7B4622]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-[#251710]">
              {report.rawAccuracy}%
            </span>
            <span className="text-xs text-[#8C7665] ml-2 font-mono">
              ({report.correctCount}/{report.totalQuestions})
            </span>
          </div>
          <div className="w-full bg-[#EFE8DE] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                report.rawAccuracy >= 75 ? 'bg-[#2E7D32]' : report.rawAccuracy >= 50 ? 'bg-[#D97706]' : 'bg-[#DC2626]'
              }`}
              style={{ width: `${report.rawAccuracy}%` }}
            />
          </div>
        </div>

        {/* Scaled Ability IRT Theta */}
        <div className="bg-[#FFFDF9] border border-[#E5D7C7] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A6455] text-xs uppercase font-mono font-semibold">
            <span>IRT Scaled Ability</span>
            <Award className="w-4 h-4 text-[#B87A42]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-[#7B4622]">
              {report.scaledAbilityScore}
            </span>
            <span className="text-xs text-[#8C7665] ml-1">/ 100</span>
            <span className="text-[11px] font-mono text-[#B87A42] block mt-0.5 font-bold">
              θ = {report.scaledAbilityTheta >= 0 ? `+${report.scaledAbilityTheta}` : report.scaledAbilityTheta}
            </span>
          </div>
          <span className="text-[11px] text-[#8C7665]">
            Weighted by question tier difficulty
          </span>
        </div>

        {/* Cohort Percentile */}
        <div className="bg-[#FFFDF9] border border-[#E5D7C7] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A6455] text-xs uppercase font-mono font-semibold">
            <span>Cohort Rank</span>
            <Trophy className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-[#2E7D32]">
              {report.cohortPercentile}
            </span>
            <span className="text-xs text-[#8C7665] ml-1 font-semibold">th percentile</span>
          </div>
          <span className="text-[11px] text-[#8C7665]">
            Outperforming {report.cohortPercentile}% of engineering peers
          </span>
        </div>

        {/* Peak Streak & Total Points */}
        <div className="bg-[#FFFDF9] border border-[#E5D7C7] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A6455] text-xs uppercase font-mono font-semibold">
            <span>Peak Streak</span>
            <Flame className="w-4 h-4 text-[#C45E28]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold font-mono text-[#C45E28] flex items-center gap-1">
              {report.maxStreak}
              <Flame className="w-5 h-5 text-[#C45E28] fill-[#C45E28]" />
            </span>
            <span className="text-xs font-mono text-[#633B1D] font-bold block mt-0.5">
              {report.totalScorePoints.toLocaleString()} bonus points
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#8C7665] font-mono">
            <Clock className="w-3 h-3 text-[#A89584]" />
            <span>Avg {report.averageTimePerQuestion}s / question</span>
          </div>
        </div>
      </div>

      {/* Weak-Topic Remediation Alert Banner */}
      {(report.weakSubtopics.length > 0 || criticalDeficitTopics.length > 0) && (
        <div className="bg-gradient-to-r from-[#FEE2E2] via-[#FFFDF9] to-[#FEF3C7] border border-[#FCA5A5] rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[#991B1B] font-bold text-sm uppercase tracking-wider">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Critical Deficiencies Detected ({report.weakSubtopics.length} Subtopics)</span>
            </div>
            <p className="text-sm text-[#4A3528]">
              The adaptive testing engine flagged conceptual vulnerabilities in:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {report.weakSubtopics.map((sub, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-[#FEE2E2] border border-[#F87171] text-[#991B1B] text-xs font-mono font-bold"
                >
                  ⚠ {sub}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleLaunchRemedialDrill}
            disabled={isLoadingDrill}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C45E28] to-[#991B1B] hover:from-[#B45309] hover:to-[#7F1D1D] text-white font-bold text-sm tracking-wide shadow-md transition-all shrink-0 active:scale-95 no-print"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>{isLoadingDrill ? 'Building Drill...' : 'Launch 5-Question Remedial Drill'}</span>
          </button>
        </div>
      )}

      {/* Radar Chart & Topic Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E5D7C7] rounded-3xl p-6 sm:p-7 shadow-xl shadow-[#4A3224]/5 flex flex-col justify-between">
          <div className="pb-3 border-b border-[#EADCCE]">
            <h3 className="font-extrabold text-[#251710] text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#7B4622]" />
              Interactive Weak-Topic Radar Chart
            </h3>
            <p className="text-xs text-[#7A6455] mt-0.5">
              Mastery boundaries across evaluated domains (&lt;60% indicates critical deficiency)
            </p>
          </div>

          <div className="py-4 bg-white rounded-2xl">
            <WeakTopicRadarChart topicDiagnostics={report.topicDiagnostics} />
          </div>

          <div className="pt-3 border-t border-[#EADCCE] flex items-center justify-between text-xs text-[#7A6455]">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7B4622]" />
              Mastery Score
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              Critical Boundary (60%)
            </span>
          </div>
        </div>

        {/* Detailed Topic Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-bold text-[#4D382B] text-sm uppercase tracking-wider font-mono">
              Domain Mastery Breakdown
            </h4>
            <span className="text-xs text-[#8C7665]">Heuristic Diagnostic Calculation</span>
          </div>

          {report.topicDiagnostics.map((topicDiag) => {
            const isDeficit = topicDiag.status === 'Critical Deficit';
            const isProficient = topicDiag.status === 'Proficient' || topicDiag.status === 'Mastered';

            return (
              <div
                key={topicDiag.topic}
                className={`p-4.5 rounded-2xl border transition-all ${
                  isDeficit
                    ? 'bg-[#FDF2F2] border-[#FCA5A5] shadow-sm'
                    : isProficient
                    ? 'bg-[#FFFDF9] border-[#B7E1C0]'
                    : 'bg-[#FFFDF9] border-[#E5D7C7]'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#251710]">
                      {topicDiag.topic}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isDeficit
                          ? 'bg-[#FEE2E2] text-[#991B1B] border-[#F87171]'
                          : isProficient
                          ? 'bg-[#EAF5EC] text-[#1E5D2F] border-[#A3D9AE]'
                          : 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]'
                      }`}
                    >
                      {topicDiag.status}
                    </span>
                  </div>

                  <span className="font-mono text-sm font-extrabold text-[#251710]">
                    {topicDiag.accuracy}%{' '}
                    <span className="text-xs text-[#8C7665] font-normal">
                      ({topicDiag.correctQuestions}/{topicDiag.totalQuestions})
                    </span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#EFE8DE] h-2 rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`h-full rounded-full ${
                      isDeficit ? 'bg-[#DC2626]' : isProficient ? 'bg-[#2E7D32]' : 'bg-[#D97706]'
                    }`}
                    style={{ width: `${topicDiag.accuracy}%` }}
                  />
                </div>

                {/* Subtopic badges */}
                {topicDiag.subtopics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {topicDiag.subtopics.map((sub, i) => (
                      <span
                        key={i}
                        className={`text-[11px] px-2.5 py-0.5 rounded-lg border ${
                          sub.accuracy < 50
                            ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B] font-bold'
                            : 'bg-[#F8F4EE] border-[#E4D5C5] text-[#543E30]'
                        }`}
                      >
                        {sub.name}: {sub.accuracy}%
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-[#7A6455] leading-relaxed italic">
                  {topicDiag.recommendation}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cohort Percentile Benchmark Chart */}
      <CohortBenchmark
        userAccuracy={report.rawAccuracy}
        cohortPercentile={report.cohortPercentile}
        cohortComparison={report.cohortComparison}
      />

      {/* Gamified Badges Unlocked */}
      {report.earnedBadges.length > 0 && (
        <div className="bg-[#FFFDF9] border border-[#E5D7C7] rounded-3xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-[#4D382B] uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#B87A42]" />
            Adaptive Badges & Milestones Unlocked
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {report.earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F8F4EE] border border-[#E5D7C7] hover:border-[#D4C3B2] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EBDDCB] border border-[#DAC5AF] flex items-center justify-center text-lg shrink-0">
                  ⚡
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[#251710]">{badge.title}</h5>
                  <p className="text-[11px] text-[#7A6455] leading-tight mt-0.5">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solution Review Breakdown with Rationale Cards */}
      <SolutionReview answers={report.answers} />

      {/* Remedial Drill Modal */}
      <RemedialQuizModal
        questions={remedialQuestions}
        weakTopics={report.weakTopics}
        weakSubtopics={report.weakSubtopics}
        isOpen={remedialModalOpen}
        onClose={() => setRemedialModalOpen(false)}
      />
    </div>
  );
};
