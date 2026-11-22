import React from 'react';
import { Difficulty } from '../../shared/types';
import { Shield, Flame, AlertCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  consecutiveCorrect: number;
  lastTransition?: {
    fromTier: Difficulty;
    toTier: Difficulty;
    reason: string;
  };
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  consecutiveCorrect,
  lastTransition
}) => {
  const getBadgeStyle = () => {
    switch (difficulty) {
      case 'Easy':
        return {
          bg: 'bg-[#EBF5EE] border-[#B7E1C0] text-[#1E5D2F]',
          dot: 'bg-[#2E7D32]',
          glow: 'shadow-sm',
          label: 'EASY TIER',
          desc: 'Foundational Knowledge',
          icon: Shield,
        };
      case 'Medium':
        return {
          bg: 'bg-[#FEF6E9] border-[#F6D69E] text-[#8C530A]',
          dot: 'bg-[#D97706]',
          glow: 'shadow-sm',
          label: 'MEDIUM TIER',
          desc: 'Analytical Application',
          icon: AlertCircle,
        };
      case 'Hard':
        return {
          bg: 'bg-[#FDF0ED] border-[#F8BDB3] text-[#A62618]',
          dot: 'bg-[#DC2626]',
          glow: 'shadow-md shadow-red-500/10',
          label: 'HARD TIER 🔥',
          desc: 'Complex Synthesis',
          icon: Flame,
        };
    }
  };

  const style = getBadgeStyle();
  const Icon = style.icon;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wider ${style.bg} ${style.glow} transition-all duration-300`}>
          <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`} />
          <Icon className="w-3.5 h-3.5" />
          <span>{style.label}</span>
        </div>

        {/* Escalation progression dots */}
        {difficulty !== 'Hard' && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5ECE1] border border-[#DECDBE] text-[11px] text-[#6E5746]" title="2 consecutive correct required to ascend">
            <span className="font-mono text-[#7A6455] font-semibold">Tier Ascend:</span>
            <div className="flex gap-1.5 items-center">
              <span className={`w-2.5 h-2.5 rounded-full border ${consecutiveCorrect >= 1 ? 'bg-[#7B4622] border-[#7B4622]' : 'border-[#C8B6A6] bg-[#FFFDF9]'}`} />
              <span className={`w-2.5 h-2.5 rounded-full border ${consecutiveCorrect >= 2 ? 'bg-[#7B4622] border-[#7B4622]' : 'border-[#C8B6A6] bg-[#FFFDF9]'}`} />
            </div>
          </div>
        )}
      </div>

      {/* Transition Banner Notification if just escalated or descended */}
      {lastTransition && (
        <div className="animate-fade-in flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-[#FAF4ED] border border-[#DECDBE] text-[#523B2B] font-medium shadow-sm">
          {lastTransition.toTier === 'Hard' || (lastTransition.fromTier === 'Easy' && lastTransition.toTier === 'Medium') ? (
            <ArrowUpCircle className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
          ) : (
            <ArrowDownCircle className="w-3.5 h-3.5 text-[#C45E28] shrink-0" />
          )}
          <span className="truncate">{lastTransition.reason}</span>
        </div>
      )}
    </div>
  );
};
