import React from 'react';
import { Flame, Award, Zap, TrendingUp } from 'lucide-react';
import { Difficulty } from '../../shared/types';

interface StreakMultiplierProps {
  streak: number;
  maxStreak: number;
  scorePoints: number;
  difficulty: Difficulty;
}

export const StreakMultiplier: React.FC<StreakMultiplierProps> = ({
  streak,
  maxStreak,
  scorePoints,
  difficulty,
}) => {
  // Hard tier gives higher streak bonus (1 + streak * 0.3) vs Medium (1 + streak * 0.15)
  const multiplier = difficulty === 'Hard'
    ? (1 + streak * 0.3).toFixed(1)
    : (1 + streak * 0.15).toFixed(1);

  const isBlazing = streak >= 3;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Streak Badge */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300 ${isBlazing
            ? 'bg-gradient-to-r from-[#FEF3C7] to-[#FEE2E2] border-[#F59E0B] text-[#92400E] shadow-sm'
            : streak > 0
              ? 'bg-[#FFFDF9] border-[#E5D7C7] text-[#2B1D15] shadow-sm'
              : 'bg-[#F7F2EB] border-[#E2D2C2] text-[#8C7665]'
          }`}
      >
        <Flame
          className={`w-4 h-4 transition-transform ${isBlazing ? 'text-[#C45E28] fill-[#C45E28] animate-bounce' : streak > 0 ? 'text-[#C45E28]' : 'text-[#A08A79]'
            }`}
        />
        <div className="flex items-baseline gap-1 font-mono">
          <span className="font-extrabold text-sm text-[#7B4622]">{streak}</span>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-[#8C7665]">Streak</span>
        </div>
      </div>

      {/* Multiplier pill */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${difficulty === 'Hard'
            ? 'bg-[#FDF0ED] border-[#F8BDB3] text-[#A62618]'
            : 'bg-[#F5ECE1] border-[#DECDBE] text-[#633B1D]'
          }`}
        title="Points Multiplier calculated from Tier & Active Streak"
      >
        <Zap className="w-3.5 h-3.5 text-[#7B4622]" />
        <span>{multiplier}x MULTIPLIER</span>
      </div>

      {/* Score Points Ticker */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#E5D7C7] text-xs font-mono font-semibold text-[#2B1D15] shadow-sm">
        <Award className="w-3.5 h-3.5 text-[#B87A42]" />
        <span className="text-[#633B1D] font-extrabold">{scorePoints.toLocaleString()}</span>
        <span className="text-[#8C7665]">pts</span>
      </div>
    </div>
  );
};
