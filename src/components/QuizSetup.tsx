import React, { useState } from 'react';
import { QuizConfig, CoreTopic } from '../../shared/types';
import { 
  Zap, 
  Target, 
  Cpu, 
  Layers, 
  Binary, 
  Network, 
  Play, 
  Sparkles, 
  Clock,
  CheckCircle2,
  Sliders,
  Infinity as InfinityIcon,
  Flame,
  Globe,
  Compass,
  Crosshair
} from 'lucide-react';

interface QuizSetupProps {
  onStartQuiz: (config: QuizConfig) => void;
  onLaunchJudgeDemo: () => void;
}

type QuestionCountOption = 5 | 10 | 20 | 'custom';
type TimeLimitOption = 5 | 10 | 20 | 0;

export const QuizSetup: React.FC<QuizSetupProps> = ({
  onStartQuiz,
  onLaunchJudgeDemo,
}) => {
  const [studentName, setStudentName] = useState<string>('Alex Chen');
  const [mode, setMode] = useState<'comprehensive' | 'domain'>('comprehensive');
  const [selectedDomain, setSelectedDomain] = useState<CoreTopic>('Operating Systems');
  
  // Adaptive Quiz Parameter States
  const [questionCountChoice, setQuestionCountChoice] = useState<QuestionCountOption>(10);
  const [customQuestions, setCustomQuestions] = useState<number>(15);
  const [timeLimitChoice, setTimeLimitChoice] = useState<TimeLimitOption>(10);

  const effectiveQuestionCount = questionCountChoice === 'custom' ? customQuestions : questionCountChoice;
  const effectiveTimeLimitSeconds = timeLimitChoice === 0 ? 0 : timeLimitChoice * 60;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartQuiz({
      mode,
      domain: mode === 'domain' ? selectedDomain : undefined,
      totalQuestions: Math.max(1, Math.min(64, effectiveQuestionCount)),
      timeLimitSeconds: effectiveTimeLimitSeconds,
      studentName: studentName.trim() || 'Engineering Candidate',
    });
  };

  const domains: { name: CoreTopic; icon: any; color: string; desc: string; count: number }[] = [
    {
      name: 'Operating Systems',
      icon: Cpu,
      color: 'from-[#5C3924]/20 to-[#8C5835]/10 border-[#8C5835]/30 text-[#6D4222]',
      desc: 'Scheduling, Deadlocks, Virtual Memory, Concurrency',
      count: 16,
    },
    {
      name: 'Data Structures',
      icon: Layers,
      color: 'from-[#2D5A3A]/20 to-[#3D7A4F]/10 border-[#3D7A4F]/30 text-[#27633B]',
      desc: 'Trees, Heaps, Hash Tables, Graphs, Stacks',
      count: 16,
    },
    {
      name: 'Algorithms',
      icon: Binary,
      color: 'from-[#6E4226]/20 to-[#A06436]/10 border-[#A06436]/30 text-[#7D4B26]',
      desc: 'Dynamic Programming, Greedy, Sorting, Graph Traversals',
      count: 16,
    },
    {
      name: 'Computer Networks',
      icon: Network,
      color: 'from-[#8C531B]/20 to-[#C47D32]/10 border-[#C47D32]/30 text-[#8C531B]',
      desc: 'TCP/IP, Congestion Control, Routing Protocols, DNS/HTTP',
      count: 16,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Hero Welcome */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBDDCB] border border-[#DAC5AF] text-[#633B1D] text-xs font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 fill-[#633B1D] text-[#633B1D]" />
          <span>Computerized Adaptive Testing Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#281A12] tracking-tight">
          QuizQuake: <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5A341C] via-[#8D5329] to-[#BF7E44]">BrainStorm Arena</span>
        </h1>
        <p className="text-[#6B5546] max-w-3xl mx-auto text-sm sm:text-base leading-relaxed">
          Dynamic real-time difficulty scaling (Easy, Medium, Hard) coupled with heuristic IRT diagnostic analysis to pinpoint your conceptual deficiencies.
        </p>
      </div>

      {/* Main Configuration Card */}
      <form onSubmit={handleSubmit} className="bg-[#FFFDF9] border border-[#E5D7C7] rounded-3xl p-6 sm:p-10 shadow-xl shadow-[#4A3224]/5 space-y-8">
        {/* Candidate Name Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4D382B] mb-2 font-mono">
            Candidate Identity / Name
          </label>
          <input
            type="text"
            required
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g. Alex Chen"
            className="w-full bg-[#F8F4EE] border border-[#DAC8B6] rounded-xl px-4 py-3.5 text-sm text-[#251710] placeholder:text-[#A08A79] focus:outline-none focus:border-[#7A4B29] focus:ring-1 focus:ring-[#7A4B29] transition-colors"
          />
        </div>

        {/* Assessment Mode Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4D382B] font-mono flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#7A4B29]" />
              <span>Assessment Mode</span>
            </label>
            <span className="text-xs font-mono font-bold text-[#6D3E1E] bg-[#EBDDCB] px-3 py-1 rounded-full border border-[#D9C4AF]">
              {mode === 'comprehensive' ? 'Comprehensive CS Arena' : `Domain Deep-Dive (${selectedDomain})`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Comprehensive CS Arena */}
            <div
              onClick={() => setMode('comprehensive')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 relative flex items-start gap-4 ${
                mode === 'comprehensive'
                  ? 'bg-[#FFFDF9] border-[#8C5835] ring-2 ring-[#8C5835]/30 shadow-md shadow-[#8C5835]/10'
                  : 'bg-[#FAF7F2] border-[#E5D7C7] hover:border-[#C4B2A0] hover:bg-[#FFFDF9]'
              }`}
            >
              <div className={`p-3 rounded-2xl shrink-0 transition-colors ${
                mode === 'comprehensive'
                  ? 'bg-gradient-to-br from-[#7B4622] to-[#A86A34] text-white shadow-md shadow-[#7B4622]/20'
                  : 'bg-[#EBDDCB] text-[#633B1D]'
              }`}>
                <Globe className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-base text-[#251710] tracking-tight">
                    Comprehensive CS Arena
                  </span>
                  <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-[#EBDDCB] text-[#5E381C] border border-[#DAC5AF]">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-[#6B5546] leading-relaxed mt-1.5">
                  Round-robin evaluation rotating through all 4 core domains (OS, DS, Algos, Networks) with dynamic adaptive tier scaling.
                </p>
              </div>

              <div className="absolute top-5 right-5">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  mode === 'comprehensive'
                    ? 'border-[#8C5835] bg-[#8C5835] text-white'
                    : 'border-[#C8B6A6] bg-[#FFFDF9]'
                }`}>
                  {mode === 'comprehensive' && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </div>
            </div>

            {/* Option 2: Domain Deep-Dive */}
            <div
              onClick={() => setMode('domain')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 relative flex items-start gap-4 ${
                mode === 'domain'
                  ? 'bg-[#FFFDF9] border-[#8C5835] ring-2 ring-[#8C5835]/30 shadow-md shadow-[#8C5835]/10'
                  : 'bg-[#FAF7F2] border-[#E5D7C7] hover:border-[#C4B2A0] hover:bg-[#FFFDF9]'
              }`}
            >
              <div className={`p-3 rounded-2xl shrink-0 transition-colors ${
                mode === 'domain'
                  ? 'bg-gradient-to-br from-[#5A3825] to-[#8C5835] text-white shadow-md shadow-[#5A3825]/20'
                  : 'bg-[#EBDDCB] text-[#633B1D]'
              }`}>
                <Crosshair className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-base text-[#251710] tracking-tight">
                    Domain Deep-Dive
                  </span>
                  <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-[#F5ECE1] text-[#7A4B29] border border-[#DECDBE]">
                    Specialized
                  </span>
                </div>
                <p className="text-xs text-[#6B5546] leading-relaxed mt-1.5">
                  Target a single discipline (e.g. Operating Systems) for focused, high-intensity conceptual stress-testing and radar profiling.
                </p>
              </div>

              <div className="absolute top-5 right-5">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  mode === 'domain'
                    ? 'border-[#8C5835] bg-[#8C5835] text-white'
                    : 'border-[#C8B6A6] bg-[#FFFDF9]'
                }`}>
                  {mode === 'domain' && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* If Domain Deep-Dive is chosen, show domain picker */}
        {mode === 'domain' && (
          <div className="space-y-2 animate-fade-in">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4D382B] font-mono">
              Select Focus Domain
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {domains.map((dom) => {
                const isSelected = selectedDomain === dom.name;
                const Icon = dom.icon;
                return (
                  <div
                    key={dom.name}
                    onClick={() => setSelectedDomain(dom.name)}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-[#F5ECE1] border-[#8C5835] text-[#251710] ring-1 ring-[#8C5835] shadow-sm'
                        : 'bg-[#FAF7F2] border-[#E8DACB] text-[#5C483A] hover:bg-[#F3ECE1]'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${dom.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#251710]">{dom.name}</div>
                      <div className="text-[10px] text-[#786151] truncate">{dom.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 1: Number of Questions Configuration */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4D382B] font-mono flex items-center gap-2">
              <Target className="w-4 h-4 text-[#7A4B29]" />
              <span>1. Number of Questions</span>
            </label>
            <span className="text-xs font-mono font-bold text-[#6D3E1E] bg-[#EBDDCB] px-3 py-1 rounded-full border border-[#D9C4AF]">
              {effectiveQuestionCount} MCQs Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Option 1: 5 MCQs */}
            <div
              onClick={() => setQuestionCountChoice(5)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                questionCountChoice === 5
                  ? 'bg-[#F5ECE1] border-[#8C5835] ring-1 ring-[#8C5835] text-[#251710] shadow-sm'
                  : 'bg-[#FAF7F2] border-[#E8DACB] text-[#665243] hover:border-[#D2BFAC]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#251710] font-mono">5 MCQs</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${questionCountChoice === 5 ? 'border-[#8C5835] bg-[#8C5835]' : 'border-[#C8B6A6]'}`}>
                  {questionCountChoice === 5 && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#7A4B29]">Quick Check</span>
              <p className="text-[11px] text-[#705B4C] mt-1 leading-relaxed">
                Fast diagnostic evaluation for swift skill verification.
              </p>
            </div>

            {/* Option 2: 10 MCQs (Standard) */}
            <div
              onClick={() => setQuestionCountChoice(10)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                questionCountChoice === 10
                  ? 'bg-[#F5ECE1] border-[#8C5835] ring-1 ring-[#8C5835] text-[#251710] shadow-sm'
                  : 'bg-[#FAF7F2] border-[#E8DACB] text-[#665243] hover:border-[#D2BFAC]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#251710] font-mono">10 MCQs</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${questionCountChoice === 10 ? 'border-[#8C5835] bg-[#8C5835]' : 'border-[#C8B6A6]'}`}>
                  {questionCountChoice === 10 && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#7A4B29]">Standard Evaluation</span>
              <p className="text-[11px] text-[#705B4C] mt-1 leading-relaxed">
                Optimal benchmark test with full adaptive tier exploration.
              </p>
            </div>

            {/* Option 3: 20 MCQs */}
            <div
              onClick={() => setQuestionCountChoice(20)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                questionCountChoice === 20
                  ? 'bg-[#F5ECE1] border-[#8C5835] ring-1 ring-[#8C5835] text-[#251710] shadow-sm'
                  : 'bg-[#FAF7F2] border-[#E8DACB] text-[#665243] hover:border-[#D2BFAC]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#251710] font-mono">20 MCQs</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${questionCountChoice === 20 ? 'border-[#8C5835] bg-[#8C5835]' : 'border-[#C8B6A6]'}`}>
                  {questionCountChoice === 20 && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#7A4B29]">Comprehensive Test</span>
              <p className="text-[11px] text-[#705B4C] mt-1 leading-relaxed">
                Thorough multi-topic stress-test and detailed radar profiling.
              </p>
            </div>

            {/* Option 4: Custom Number */}
            <div
              onClick={() => setQuestionCountChoice('custom')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                questionCountChoice === 'custom'
                  ? 'bg-[#F5ECE1] border-[#8C5835] ring-1 ring-[#8C5835] text-[#251710] shadow-sm'
                  : 'bg-[#FAF7F2] border-[#E8DACB] text-[#665243] hover:border-[#D2BFAC]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#251710] font-mono">Custom Number</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${questionCountChoice === 'custom' ? 'border-[#8C5835] bg-[#8C5835]' : 'border-[#C8B6A6]'}`}>
                  {questionCountChoice === 'custom' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#7A4B29]">Custom Range</span>
              <p className="text-[11px] text-[#705B4C] mt-1 leading-relaxed">
                Tailor an exact custom count between 1 and 64 questions.
              </p>
            </div>
          </div>

          {/* Custom Number Input when 'custom' is active */}
          {questionCountChoice === 'custom' && (
            <div className="p-4 rounded-xl bg-[#F8F4EE] border border-[#DAC8B6] flex items-center gap-4 animate-fade-in">
              <Sliders className="w-4 h-4 text-[#7A4B29] shrink-0" />
              <div className="flex-1 flex items-center gap-3">
                <span className="text-xs text-[#4D382B] font-mono font-medium">Desired MCQ Count:</span>
                <input
                  type="number"
                  min={1}
                  max={64}
                  value={customQuestions}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setCustomQuestions(Math.max(1, Math.min(64, val)));
                  }}
                  className="w-20 px-3 py-1.5 bg-[#FFFDF9] border border-[#C8B6A6] rounded-lg text-[#251710] font-mono text-sm text-center focus:border-[#7A4B29] focus:outline-none"
                />
                <span className="text-[11px] text-[#856F5F]">(Repository maximum: 64 questions)</span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Time Limit Configuration */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4D382B] font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A06436]" />
              <span>2. Time Limit</span>
            </label>
            <span className="text-xs font-mono font-bold text-[#7A4B29] bg-[#EBDDCB] px-3 py-1 rounded-full border border-[#D9C4AF]">
              {timeLimitChoice === 0 ? 'Untimed Practice' : `${timeLimitChoice} Minutes Limit`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Option 1: 5 Minutes */}
            <div
              onClick={() => setTimeLimitChoice(5)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                timeLimitChoice === 5
                  ? 'bg-[#F5ECE1] border-[#8C5835] ring-1 ring-[#8C5835] text-[#251710] shadow-sm'
                  : 'bg-[#FAF7F2] border-[#E8DACB] text-[#665243] hover:border-[#D2BFAC]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#251710] font-mono flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#C45E28]" />
                  5 Minutes
                </span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${timeLimitChoice === 5 ? 'border-[#8C5835] bg-[#8C5835]' : 'border-[#C8B6A6]'}`}>
                  {timeLimitChoice === 5 && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#7A4B29]">Sprint Mode</span>
              <p className="text-[11px] text-[#705B4C] mt-1 leading-relaxed">
                Fast pace testing instant recall and rapid decision making.
              </p>
            </div>

            {/* Option 2: 10 Minutes */}
            <div
              onClick={() => setTimeLimitChoice(10)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                timeLimitChoice === 10
                  ? 'bg-[#F5ECE1] border-[#8C5835] ring-1 ring-[#8C5835] text-[#251710] shadow-sm'
                  : 'bg-[#FAF7F2] border-[#E8DACB] text-[#665243] hover:border-[#D2BFAC]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#251710] font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#A06436]" />
                  10 Minutes
                </span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${timeLimitChoice === 10 ? 'border-[#8C5835] bg-[#8C5835]' : 'border-[#C8B6A6]'}`}>
                  {timeLimitChoice === 10 && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#7A4B29]">Standard Mode</span>
              <p className="text-[11px] text-[#705B4C] mt-1 leading-relaxed">
                Comfortable pace with adequate time for complex code analysis.
              </p>
            </div>

            {/* Option 3: 20 Minutes */}
            <div
              onClick={() => setTimeLimitChoice(20)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                timeLimitChoice === 20
                  ? 'bg-[#F5ECE1] border-[#8C5835] ring-1 ring-[#8C5835] text-[#251710] shadow-sm'
                  : 'bg-[#FAF7F2] border-[#E8DACB] text-[#665243] hover:border-[#D2BFAC]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#251710] font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#A06436]" />
                  20 Minutes
                </span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${timeLimitChoice === 20 ? 'border-[#8C5835] bg-[#8C5835]' : 'border-[#C8B6A6]'}`}>
                  {timeLimitChoice === 20 && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#7A4B29]">In-Depth Analysis</span>
              <p className="text-[11px] text-[#705B4C] mt-1 leading-relaxed">
                Extended duration for thorough calculations & edge case evaluation.
              </p>
            </div>

            {/* Option 4: No Timer / Untimed Practice */}
            <div
              onClick={() => setTimeLimitChoice(0)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                timeLimitChoice === 0
                  ? 'bg-[#F5ECE1] border-[#8C5835] ring-1 ring-[#8C5835] text-[#251710] shadow-sm'
                  : 'bg-[#FAF7F2] border-[#E8DACB] text-[#665243] hover:border-[#D2BFAC]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-[#251710] font-mono flex items-center gap-1.5">
                  <InfinityIcon className="w-3.5 h-3.5 text-[#2E7D32]" />
                  No Timer
                </span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${timeLimitChoice === 0 ? 'border-[#8C5835] bg-[#8C5835]' : 'border-[#C8B6A6]'}`}>
                  {timeLimitChoice === 0 && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#2E7D32]">Untimed Practice</span>
              <p className="text-[11px] text-[#705B4C] mt-1 leading-relaxed">
                Zero pressure self-study with elapsed stopwatch tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Parameters Summary Pill */}
        <div className="bg-[#F7F2EB] border border-[#E2D2C2] rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-[#6D5849] font-medium">Current Setup:</span>
            <span className="px-3 py-1 rounded-lg bg-[#EBDDCB] border border-[#DAC5AF] text-[#633B1D] font-bold">
              {effectiveQuestionCount} Questions
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#EBDDCB] border border-[#DAC5AF] text-[#633B1D] font-bold">
              {timeLimitChoice === 0 ? 'Untimed Practice' : `${timeLimitChoice} Minutes`}
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#EAE0D4] border border-[#D8C7B5] text-[#4A3222] font-bold">
              {mode === 'comprehensive' ? 'Comprehensive CS' : selectedDomain}
            </span>
          </div>

          <span className="text-[11px] text-[#7D6656]">
            {timeLimitChoice === 0 
              ? 'Self-paced mode with elapsed stopwatch' 
              : `Avg ~${Math.round((timeLimitChoice * 60) / effectiveQuestionCount)}s per question`}
          </span>
        </div>

        {/* Submit / Launch Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-[#4A2E1D] via-[#5C3924] to-[#73472C] hover:from-[#3D2517] hover:to-[#5E3922] text-[#FFFDF9] font-extrabold text-sm tracking-wide shadow-xl shadow-[#4A2E1D]/20 transition-all active:scale-[0.99]"
          >
            <Play className="w-4 h-4 fill-white text-white" />
            <span>Enter BrainStorm Arena</span>
          </button>

          <button
            type="button"
            onClick={onLaunchJudgeDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-5 rounded-xl bg-[#EFE6DC] hover:bg-[#E5DACD] text-[#3D281C] border border-[#D5C4B4] font-bold text-xs transition-colors shadow-sm"
            title="Execute the exact hackathon brief flow"
          >
            <Sparkles className="w-4 h-4 text-[#C47D32]" />
            <span>Judge Demo Flow</span>
          </button>
        </div>
      </form>

      {/* Core Features Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5D7C7] shadow-sm">
          <div className="text-xs font-bold text-[#2E7D32] uppercase font-mono mb-1">Adaptive Scaling</div>
          <p className="text-xs text-[#665243] leading-relaxed">
            2 consecutive correct answers elevate difficulty to Hard; 1 incorrect descends.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5D7C7] shadow-sm">
          <div className="text-xs font-bold text-[#7A4B29] uppercase font-mono mb-1">Weak-Topic Radar</div>
          <p className="text-xs text-[#665243] leading-relaxed">
            Visual radar analysis highlights specific conceptual gaps below the 60% threshold.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5D7C7] shadow-sm">
          <div className="text-xs font-bold text-[#A86A34] uppercase font-mono mb-1">Targeted Drill</div>
          <p className="text-xs text-[#665243] leading-relaxed">
            One-click 5-question remedial drill generator focused exclusively on flagged topics.
          </p>
        </div>
      </div>
    </div>
  );
};
