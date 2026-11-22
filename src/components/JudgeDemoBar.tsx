import React from 'react';
import { Sparkles, Play, Flame, HelpCircle } from 'lucide-react';

interface JudgeDemoBarProps {
  onRunInstantDemoReport: () => void;
  onStartGuidedOSDemo: () => void;
}

export const JudgeDemoBar: React.FC<JudgeDemoBarProps> = ({
  onRunInstantDemoReport,
  onStartGuidedOSDemo,
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-y border-indigo-500/30 py-2.5 px-4 backdrop-blur-md shadow-lg no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Hackathon Brief Demo Preset
          </span>
          <span className="text-slate-300">
            <strong>Target Flow:</strong> OS Test &rarr; 2 Medium Correct &rarr; Ascend to Hard (Deadlocks) &rarr; Incorrect &rarr; Drops to Med &rarr; Flags 'Deadlock Avoidance'
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onStartGuidedOSDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors"
            title="Starts an OS test tailored to step through this exact sequence"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Demo Test</span>
          </button>

          <button
            onClick={onRunInstantDemoReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            title="Instantly generate and inspect the completed Diagnostic Scorecard from the brief"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>1-Click Completed Demo Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
