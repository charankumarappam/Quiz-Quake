import React, { useState, useEffect } from 'react';
import { Question, CoreTopic, Difficulty } from '../../shared/types';
import { QuizApi } from '../services/api';
import { Database, X, Search, Filter, BookOpen, Layers } from 'lucide-react';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({ isOpen, onClose }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      QuizApi.getAllQuestions().then((res: Question[]) => setQuestions(res));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = questions.filter(q => {
    if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return q.question.toLowerCase().includes(s) || q.subtopic.toLowerCase().includes(s);
    }
    return true;
  });

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-[#EBF5EE] border-[#B7E1C0] text-[#1E5D2F]';
      case 'Medium':
        return 'bg-[#FEF6E9] border-[#F6D69E] text-[#8C530A]';
      case 'Hard':
        return 'bg-[#FDF0ED] border-[#F8BDB3] text-[#A62618] font-bold';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#251710]/60 backdrop-blur-md">
      <div className="bg-[#FFFDF9] border border-[#E5D7C7] rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#EADCCE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EBDDCB] border border-[#DAC5AF] text-[#633B1D]">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#251710] flex items-center gap-2">
                Topic-Tagged Question Repository ({questions.length} Verified MCQs)
              </h3>
              <p className="text-xs text-[#7A6455]">
                Rigorous Computer Science items tagged by taxonomy and difficulty tier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A6455] hover:text-[#251710] hover:bg-[#F2E7DC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-[#F8F4EE] border-b border-[#E5D7C7] flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#8C7665] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search question stem or subtopic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-[#DAC8B6] rounded-xl pl-9 pr-4 py-2 text-xs text-[#251710] placeholder:text-[#A08A79] focus:outline-none focus:border-[#7A4B29]"
            />
          </div>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-[#FFFDF9] border border-[#DAC8B6] rounded-xl px-3 py-2 text-xs text-[#251710] focus:outline-none focus:border-[#7A4B29]"
          >
            <option value="all">All Domains (4)</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Data Structures">Data Structures</option>
            <option value="Algorithms">Algorithms</option>
            <option value="Computer Networks">Computer Networks</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#FFFDF9] border border-[#DAC8B6] rounded-xl px-3 py-2 text-xs text-[#251710] focus:outline-none focus:border-[#7A4B29]"
          >
            <option value="all">All Difficulty Tiers</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <span className="text-xs text-[#7A6455] font-mono font-semibold">
            Showing {filtered.length} items
          </span>
        </div>

        {/* Question Cards List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="bg-[#FAF7F2] border border-[#E5D7C7] rounded-2xl p-5 hover:border-[#C4B2A0] transition-colors space-y-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#7A6455] font-bold">{q.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyBadge(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-[#EBDDCB] text-[#4A3222] font-semibold flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#7A4B29]" />
                    {q.topic}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-[#F5ECE1] border border-[#DECDBE] text-[#633B1D] flex items-center gap-1 font-medium">
                    <Layers className="w-3 h-3 text-[#8C5835]" />
                    {q.subtopic}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#8C7665]">Target: {q.timeTargetSeconds}s</span>
              </div>

              <p className="text-sm font-semibold text-[#251710]">{q.question}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {q.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      i === q.correctAnswer
                        ? 'bg-[#EAF5EC] border-[#A3D9AE] text-[#1E5D2F] font-semibold'
                        : 'bg-[#FFFDF9] border-[#E8DACB] text-[#4F3B2C]'
                    }`}
                  >
                    <span className="w-4 h-4 rounded bg-[#EFE5DA] text-[#6D5544] text-[10px] flex items-center justify-center font-mono font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="truncate">{opt}</span>
                    {i === q.correctAnswer && (
                      <span className="ml-auto text-[9px] uppercase font-bold text-[#1E5D2F] bg-[#2E7D32]/10 px-1.5 py-0.5 rounded border border-[#2E7D32]/20">
                        Key
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-xs text-[#7A6455] pt-2 border-t border-[#EADCCE] italic">
                <span className="text-[#7B4622] font-semibold not-italic">Key Takeaway: </span>
                {q.conceptSummary}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
