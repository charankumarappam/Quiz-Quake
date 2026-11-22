import React, { useState, useEffect } from 'react';
import { Question } from '../../shared/types';
import { BookOpen, Layers, Check, ArrowRight, Clock } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswerSubmit: (selectedOption: number, timeSpentSeconds: number) => void;
  isSubmitting: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  onAnswerSubmit,
  isSubmitting,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);

  // Reset selected option and time counter when question changes
  useEffect(() => {
    setSelectedOption(null);
    setTimeSpent(0);

    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [question.id]);

  // Keyboard shortcuts (1-4 or A-D, Enter to submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting) return;

      if (e.key >= '1' && e.key <= '4') {
        setSelectedOption(parseInt(e.key) - 1);
      } else if (['a', 'A'].includes(e.key)) {
        setSelectedOption(0);
      } else if (['b', 'B'].includes(e.key)) {
        setSelectedOption(1);
      } else if (['c', 'C'].includes(e.key)) {
        setSelectedOption(2);
      } else if (['d', 'D'].includes(e.key)) {
        setSelectedOption(3);
      } else if (e.key === 'Enter' && selectedOption !== null) {
        onAnswerSubmit(selectedOption, timeSpent);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOption, timeSpent, isSubmitting, onAnswerSubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption === null || isSubmitting) return;
    onAnswerSubmit(selectedOption, timeSpent);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full bg-[#FFFDF9] border border-[#E5D7C7] rounded-3xl p-6 sm:p-10 shadow-xl shadow-[#4A3224]/5 transition-all duration-300">
      {/* Question Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#EADCCE]">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#EBDDCB] border border-[#DAC5AF] text-[#633B1D] text-xs font-bold rounded-lg font-mono">
            QUESTION {questionIndex} / {totalQuestions}
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5ECE1] text-[#4A3222] text-xs font-semibold rounded-lg">
            <BookOpen className="w-3.5 h-3.5 text-[#7B4622]" />
            <span>{question.topic}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF6F0] border border-[#DECDBE] text-[#665243] text-xs font-medium rounded-lg">
            <Layers className="w-3.5 h-3.5 text-[#8C5835]" />
            <span>{question.subtopic}</span>
          </div>
        </div>

        {/* Time spent on current question */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-[#685242] bg-[#F7F2EB] px-3 py-1 rounded-lg border border-[#E2D2C2]">
          <Clock className="w-3.5 h-3.5 text-[#8C5835]" />
          <span className="font-semibold">{timeSpent}s spent</span>
          <span className="text-[#B59F8E]">/</span>
          <span className="text-[#8C7665]">target {question.timeTargetSeconds}s</span>
        </div>
      </div>

      {/* Question Stem */}
      <div className="my-7">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#251710] leading-relaxed">
          {question.question}
        </h3>

        {/* Optional Code Snippet block */}
        {question.codeSnippet && (
          <div className="mt-5 p-4 rounded-xl bg-[#281A12] border border-[#442F23] font-mono text-xs sm:text-sm text-[#F5E6D8] overflow-x-auto shadow-inner">
            <pre>{question.codeSnippet}</pre>
          </div>
        )}
      </div>

      {/* Options List */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <label
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`flex items-start gap-4 p-4.5 rounded-2xl border cursor-pointer transition-all duration-200 group ${
                  isSelected
                    ? 'bg-[#F5ECE1] border-[#8C5835] ring-1 ring-[#8C5835] text-[#251710] shadow-md shadow-[#8C5835]/10'
                    : 'bg-[#FAF7F2] border-[#E8DACB] text-[#4F3B2C] hover:border-[#D0BCAB] hover:bg-[#F5ECE1]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#7B4622] text-white shadow-sm'
                      : 'bg-[#EFE5DA] border border-[#DCCBC4] text-[#6D5544] group-hover:border-[#C4B1A0] group-hover:text-[#251710]'
                  }`}
                >
                  {optionLetters[idx]}
                </div>

                <div className="flex-1 text-sm sm:text-base leading-snug pt-0.5 select-none font-medium">
                  {option}
                </div>

                <div className="shrink-0 pt-0.5">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[#8C5835] bg-[#8C5835] text-white'
                        : 'border-[#C8B6A6] bg-[#FFFDF9] group-hover:border-[#8C5835]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Action Button & Tip */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EADCCE]">
          <div className="text-xs text-[#8A7565] font-mono hidden sm:block">
            Keyboard shortcut: Press <kbd className="px-2 py-0.5 bg-[#F2E7DC] rounded border border-[#D8C7B5] text-[#4A3222] font-bold">1-4</kbd> or <kbd className="px-2 py-0.5 bg-[#F2E7DC] rounded border border-[#D8C7B5] text-[#4A3222] font-bold">Enter</kbd>
          </div>

          <button
            type="submit"
            disabled={selectedOption === null || isSubmitting}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-extrabold text-sm tracking-wide transition-all shadow-lg ${
              selectedOption === null || isSubmitting
                ? 'bg-[#E5D7C7] text-[#9A8574] border border-[#D4C3B2] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#4A2E1D] to-[#6E4226] hover:from-[#3B2416] hover:to-[#5A351E] text-[#FFFDF9] shadow-[#4A2E1D]/20 active:scale-[0.98]'
            }`}
          >
            <span>{questionIndex === totalQuestions ? 'Submit Assessment' : 'Confirm & Proceed'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
