import React from 'react';
import { Zap, History, Database, Shield, BookOpen } from 'lucide-react';

interface NavbarProps {
  onOpenHistory: () => void;
  onOpenQuestionBank: () => void;
  onResetToHome: () => void;
  isQuizActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  onOpenQuestionBank,
  onResetToHome,
  isQuizActive,
}) => {
  return (
    <header className="w-full bg-[#FAF6F0]/95 border-b border-[#E6D7C8] sticky top-0 z-40 backdrop-blur-md no-print shadow-sm shadow-[#4A3224]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onResetToHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4A2E1D] via-[#6B3F24] to-[#B87A42] flex items-center justify-center text-white shadow-md shadow-[#4A2E1D]/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#2B1D15]">
                Quiz<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B4622] to-[#B87A42]">Quake</span>
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-[#EBDDCB] border border-[#D9C4AF] text-[#633B1D]">
                BrainStorm Arena
              </span>
            </div>
            <p className="text-[11px] text-[#7A6455] hidden sm:block">
              Computerized Adaptive Testing & Cognitive Diagnostics
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenQuestionBank}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F2E7DC] hover:bg-[#E8DACB] text-[#3D281C] border border-[#DAC6B4] text-xs font-semibold transition-colors shadow-sm"
            title="Browse all 60+ verified Computer Science questions across 4 domains"
          >
            <Database className="w-3.5 h-3.5 text-[#7B4622]" />
            <span className="hidden md:inline">Question Bank (60+)</span>
            <span className="md:hidden">Bank</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F2E7DC] hover:bg-[#E8DACB] text-[#3D281C] border border-[#DAC6B4] text-xs font-semibold transition-colors shadow-sm"
            title="View past quiz attempts & improvement trajectories"
          >
            <History className="w-3.5 h-3.5 text-[#A86A34]" />
            <span className="hidden sm:inline">Attempt History</span>
            <span className="sm:hidden">History</span>
          </button>

          {isQuizActive && (
            <button
              onClick={onResetToHome}
              className="px-3.5 py-1.5 rounded-xl bg-[#FDE8E8] hover:bg-[#FBD5D5] text-[#9B1C1C] border border-[#F8B4B4] text-xs font-semibold transition-colors"
            >
              Exit Arena
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
