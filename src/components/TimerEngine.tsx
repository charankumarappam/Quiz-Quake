import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, Infinity as InfinityIcon } from 'lucide-react';

interface TimerEngineProps {
  initialRemainingSeconds: number;
  onTimeExpired: () => void;
  onTick?: (remaining: number) => void;
  isPaused?: boolean;
}

export const TimerEngine: React.FC<TimerEngineProps> = ({
  initialRemainingSeconds,
  onTimeExpired,
  onTick,
  isPaused = false,
}) => {
  const isUntimed = initialRemainingSeconds <= 0;
  const [remaining, setRemaining] = useState<number>(initialRemainingSeconds);
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    setRemaining(initialRemainingSeconds);
  }, [initialRemainingSeconds]);

  useEffect(() => {
    if (isPaused) return;

    if (isUntimed) {
      const timer = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (onTick) onTick(next);
          return next;
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeExpired();
          return 0;
        }
        const updated = prev - 1;
        if (onTick) onTick(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isUntimed, onTimeExpired, onTick]);

  if (isUntimed) {
    const elapsedMinutes = Math.floor(elapsed / 60);
    const elapsedSeconds = elapsed % 60;
    const formattedElapsed = `${String(elapsedMinutes).padStart(2, '0')}:${String(elapsedSeconds).padStart(2, '0')}`;

    return (
      <div
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border bg-[#EAF5EC] border-[#A3D9AE] text-[#1E5D2F] font-mono text-sm font-semibold tracking-wider shadow-sm"
        title="Untimed Practice Mode - Active Stopwatch"
      >
        <InfinityIcon className="w-4 h-4 text-[#2E7D32]" />
        <span>{formattedElapsed}</span>
        <span className="text-[10px] uppercase font-bold text-[#2E7D32] tracking-normal ml-1">
          Untimed
        </span>
      </div>
    );
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = remaining <= 60;
  const isCriticalTime = remaining <= 20;

  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all duration-300 font-mono text-sm font-semibold tracking-wider ${
        isCriticalTime
          ? 'bg-[#FEE2E2] border-[#EF4444] text-[#991B1B] animate-pulse shadow-md'
          : isLowTime
          ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E] shadow-sm'
          : 'bg-[#FFFDF9] border-[#DECDBE] text-[#3A281E] shadow-sm'
      }`}
      title="Synchronized Timer Engine with Automated Submission"
    >
      {isCriticalTime ? (
        <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
      ) : (
        <Clock className={`w-4 h-4 ${isLowTime ? 'text-amber-600' : 'text-[#7B4622]'}`} />
      )}
      <span>{formatted}</span>
      {isCriticalTime && (
        <span className="text-[10px] uppercase font-bold text-red-600 tracking-normal ml-1">
          Expiring!
        </span>
      )}
    </div>
  );
};
