import React, { useState } from 'react';
import { QuizAnswer, CoreTopic } from '../../shared/types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Filter, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

interface SolutionReviewProps {
  answers: QuizAnswer[];
}

export const SolutionReview: React.FC<SolutionReviewProps> = ({ answers }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const topics = Array.from(new Set(answers.map(a => a.topic)));

  const filteredAnswers = answers.filter(a => {
    if (filterMode === 'incorrect' && a.isCorrect) return false;
    if (filterMode === 'correct' && !a.isCorrect) return false;
    if (selectedTopic !== 'all' && a.topic !== selectedTopic) return false;
    return true;
  });

  const optionLetters = ['A', 'B', 'C', 'D'];

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-[#EBF5EE] border-[#B7E1C0] text-[#1E5D2F]';
      case 'Medium':
        return 'bg-[#FEF6E9] border-[#F6D69E] text-[#8C530A]';
      case 'Hard':
        return 'bg-[#FDF0ED] border-[#F8BDB3] text-[#A62618] font-bold';
      default:
        return 'bg-[#F5ECE1] text-[#4A3222]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFDF9] border border-[#E5D7C7] p-6 rounded-3xl shadow-sm">
        <div>
          <h4 className="text-lg font-bold text-[#251710] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#7B4622]" />
            Solution Review Breakdown
          </h4>
          <p className="text-xs text-[#7A6455] mt-1">
            Analyze rationale, correct keys, and identify where misconceptions arose.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex rounded-xl bg-[#F5ECE1] border border-[#DECDBE] p-1">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterMode === 'all'
                  ? 'bg-[#7B4622] text-white shadow'
                  : 'text-[#6E5848] hover:text-[#251710]'
              }`}
            >
              All ({answers.length})
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterMode === 'incorrect'
                  ? 'bg-[#DC2626] text-white shadow'
                  : 'text-[#6E5848] hover:text-[#251710]'
              }`}
            >
              Incorrect ({answers.filter(a => !a.isCorrect).length})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterMode === 'correct'
                  ? 'bg-[#2E7D32] text-white shadow'
                  : 'text-[#6E5848] hover:text-[#251710]'
              }`}
            >
              Correct ({answers.filter(a => a.isCorrect).length})
            </button>
          </div>

          {/* Topic selector */}
          {topics.length > 1 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-[#F8F4EE] border border-[#DAC8B6] text-[#251710] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#7A4B29]"
            >
              <option value="all">All Evaluated Topics</option>
              {topics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filteredAnswers.length === 0 ? (
          <div className="text-center py-10 bg-[#FFFDF9] border border-[#E5D7C7] rounded-3xl text-[#7A6455]">
            No questions match the current filter selection.
          </div>
        ) : (
          filteredAnswers.map((answer, index) => {
            const isExpanded = expandedId === answer.questionId || expandedId === null;

            return (
              <div
                key={answer.questionId}
                className={`bg-[#FFFDF9] border rounded-2xl overflow-hidden transition-all duration-200 shadow-sm ${
                  answer.isCorrect
                    ? 'border-[#B7E1C0]'
                    : 'border-[#FCA5A5]'
                }`}
              >
                {/* Accordion trigger / Header */}
                <div
                  onClick={() => setExpandedId(expandedId === answer.questionId ? '' : answer.questionId)}
                  className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#FAF6F0] select-none"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="pt-0.5">
                      {answer.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-[#7A6455]">
                          Q{index + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getDifficultyBadge(answer.difficulty)}`}>
                          {answer.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[#F5ECE1] text-[#4A3222] font-semibold">
                          {answer.topic}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[#FAF6F0] text-[#7B4622] font-medium border border-[#DECDBE]">
                          {answer.subtopic}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-[#251710]">
                        {answer.questionText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-xs font-mono text-[#7A6455]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{answer.timeSpentSeconds}s</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#7A6455]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#7A6455]" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#EADCCE] space-y-4">
                    {/* Options list */}
                    <div className="grid grid-cols-1 gap-2 pt-2">
                      {answer.options.map((opt, optIdx) => {
                        const isUserChoice = answer.selectedOption === optIdx;
                        const isCorrectChoice = answer.correctAnswer === optIdx;

                        let style = 'bg-[#FAF7F2] border-[#E8DACB] text-[#4F3B2C]';
                        if (isCorrectChoice) {
                          style = 'bg-[#EAF5EC] border-[#A3D9AE] text-[#1E5D2F] font-semibold';
                        } else if (isUserChoice && !answer.isCorrect) {
                          style = 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B] line-through';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm ${style}`}
                          >
                            <span className="w-5 h-5 rounded flex items-center justify-center bg-[#EBDDCB] text-[#4A3222] text-[11px] font-mono shrink-0 font-bold">
                              {optionLetters[optIdx]}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrectChoice && (
                              <span className="px-2 py-0.5 rounded bg-[#2E7D32]/10 text-[#1E5D2F] text-[10px] font-bold uppercase shrink-0 border border-[#2E7D32]/30">
                                Correct Answer
                              </span>
                            )}
                            {isUserChoice && !isCorrectChoice && (
                              <span className="px-2 py-0.5 rounded bg-[#DC2626]/10 text-[#991B1B] text-[10px] font-bold uppercase shrink-0 border border-[#DC2626]/30">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Deep explanation */}
                    <div className="bg-[#F8F4EE] border border-[#DAC8B6] rounded-xl p-4.5 space-y-2">
                      <div className="flex items-center gap-2 text-[#7B4622] text-xs font-bold uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4" />
                        <span>Comprehensive Explanation & Rationale</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#4A3528] leading-relaxed">
                        {answer.explanation}
                      </p>
                      <div className="pt-2 border-t border-[#E4D5C5] flex items-center gap-2 text-xs text-[#7B4622] font-semibold">
                        <span className="text-[#8C7665]">Core Takeaway:</span>
                        <span>{answer.conceptSummary}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
