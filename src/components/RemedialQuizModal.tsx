import React, { useState } from 'react';
import { Question } from '../../shared/types';
import { 
  Zap, 
  X, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  ArrowRight, 
  Trophy, 
  Target 
} from 'lucide-react';

interface RemedialQuizModalProps {
  questions: Question[];
  weakTopics: string[];
  weakSubtopics: string[];
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export const RemedialQuizModal: React.FC<RemedialQuizModalProps> = ({
  questions,
  weakTopics,
  weakSubtopics,
  isOpen,
  onClose,
  onCompleted,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const optionLetters = ['A', 'B', 'C', 'D'];

  const handleSelectOption = (idx: number) => {
    if (hasSubmittedAnswer) return;
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    setHasSubmittedAnswer(true);
    if (selectedOption === currentQ.correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasSubmittedAnswer(false);
    } else {
      setIsFinished(true);
      if (onCompleted) onCompleted();
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasSubmittedAnswer(false);
    setCorrectCount(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#251710]/60 backdrop-blur-md">
      <div className="bg-[#FFFDF9] border border-[#E5D7C7] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#EADCCE] flex items-center justify-between bg-[#F8F4EE]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#EBDDCB] border border-[#DAC5AF] text-[#633B1D]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#251710] flex items-center gap-2">
                Targeted Remedial Drill (5 Questions)
              </h3>
              <p className="text-xs text-[#7A6455]">
                Focusing on: <span className="text-[#8C5835] font-semibold">{weakSubtopics.join(', ') || weakTopics.join(', ') || 'Core Invariants'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A6455] hover:text-[#251710] hover:bg-[#F2E7DC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {isFinished ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EAF5EC] border border-[#A3D9AE] flex items-center justify-center mx-auto text-[#1E5D2F]">
                <Trophy className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-[#251710]">Remediation Drill Complete!</h4>
              <p className="text-sm text-[#4A3528] max-w-md mx-auto">
                You successfully answered <strong className="text-[#1E5D2F] font-bold">{correctCount} of {questions.length}</strong> questions correctly on your targeted weak concepts.
              </p>
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl border border-[#DAC6B4] hover:bg-[#F2E7DC] text-[#3D281C] text-sm font-semibold transition-colors"
                >
                  Retry Drill
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A2E1D] to-[#6E4226] hover:from-[#3B2416] hover:to-[#5A351E] text-white text-sm font-bold shadow-md transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs text-[#7A6455] pb-2 border-b border-[#EADCCE]">
                <span className="font-mono font-bold text-[#7B4622]">
                  DRILL STEP {currentIndex + 1} OF {questions.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#EBDDCB] text-[#4A3222] font-semibold text-[11px]">
                  {currentQ.subtopic}
                </span>
              </div>

              {/* Question Stem */}
              <div className="text-base sm:text-lg font-bold text-[#251710] leading-snug">
                {currentQ.question}
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-1">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctAnswer;

                  let style = 'bg-[#FAF7F2] border-[#E8DACB] text-[#4F3B2C] hover:border-[#D0BCAB]';

                  if (hasSubmittedAnswer) {
                    if (isCorrect) {
                      style = 'bg-[#EAF5EC] border-[#A3D9AE] text-[#1E5D2F] font-semibold';
                    } else if (isSelected) {
                      style = 'bg-[#FEE2E2] border-[#FCA5A5] text-[#991B1B]';
                    } else {
                      style = 'bg-[#F8F4EE] border-[#EADCCE] text-[#A08A79] opacity-60';
                    }
                  } else if (isSelected) {
                    style = 'bg-[#F5ECE1] border-[#8C5835] text-[#251710] ring-1 ring-[#8C5835] shadow-sm';
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${style}`}
                    >
                      <span className="w-5 h-5 rounded flex items-center justify-center bg-[#EBDDCB] text-[#4A3222] text-[11px] font-mono shrink-0 font-bold">
                        {optionLetters[idx]}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {hasSubmittedAnswer && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                      )}
                      {hasSubmittedAnswer && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Immediate Explanatory Feedback */}
              {hasSubmittedAnswer && (
                <div className="p-4 rounded-xl bg-[#F8F4EE] border border-[#DAC8B6] text-xs text-[#4A3528] space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-[#7B4622] font-bold uppercase tracking-wider text-[11px]">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Conceptual Takeaway</span>
                  </div>
                  <p>{currentQ.explanation}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex justify-end">
                {!hasSubmittedAnswer ? (
                  <button
                    onClick={handleConfirmAnswer}
                    disabled={selectedOption === null}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedOption === null
                        ? 'bg-[#E5D7C7] text-[#9A8574] cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#4A2E1D] to-[#6E4226] hover:from-[#3B2416] hover:to-[#5A351E] text-white shadow-md'
                    }`}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#1E5D2F] hover:from-[#256629] hover:to-[#174825] text-white text-xs font-bold shadow-md"
                  >
                    <span>{currentIndex + 1 === questions.length ? 'Finish Drill' : 'Next Question'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
