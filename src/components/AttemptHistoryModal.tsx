import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { History, X, Trophy, TrendingUp, Calendar, Zap } from 'lucide-react';
import { DiagnosticReport } from '../../shared/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface AttemptHistoryModalProps {
  history: DiagnosticReport[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAttempt?: (report: DiagnosticReport) => void;
  onClearHistory?: () => void;
}

export const AttemptHistoryModal: React.FC<AttemptHistoryModalProps> = ({
  history,
  isOpen,
  onClose,
  onSelectAttempt,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  // Chart data: chronological order (oldest to newest)
  const chronological = [...history].reverse();
  const lineData = {
    labels: chronological.map((_, i) => `Attempt #${i + 1}`),
    datasets: [
      {
        label: 'Accuracy (%)',
        data: chronological.map(h => h.rawAccuracy),
        borderColor: 'rgba(123, 70, 34, 1)',
        backgroundColor: 'rgba(123, 70, 34, 0.15)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: 'rgba(184, 122, 66, 1)',
        pointRadius: 4,
      },
      {
        label: 'Scaled Ability (0-100)',
        data: chronological.map(h => h.scaledAbilityScore),
        borderColor: 'rgba(46, 125, 50, 1)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(215, 195, 175, 0.4)' },
        ticks: { color: '#7A6455', font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#7A6455', font: { size: 10 } },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(43, 29, 21, 0.95)',
        titleColor: '#FFFDF9',
        bodyColor: '#F2ECE4',
        borderColor: '#DECDBE',
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#251710]/60 backdrop-blur-md">
      <div className="bg-[#FFFDF9] border border-[#E5D7C7] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#EADCCE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EBDDCB] border border-[#DAC5AF] text-[#633B1D]">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#251710]">Historical Attempt Tracker</h3>
              <p className="text-xs text-[#7A6455]">Visualizing diagnostic trajectories & cognitive gains</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && onClearHistory && (
              <button
                onClick={onClearHistory}
                className="text-xs text-[#8C5835] hover:text-[#DC2626] px-3 py-1.5 rounded-lg border border-[#DAC6B4] hover:border-[#DC2626] transition-colors"
              >
                Clear Records
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7A6455] hover:text-[#251710] hover:bg-[#F2E7DC] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-[#7A6455]">
              <History className="w-12 h-12 mx-auto text-[#A89584] mb-3" />
              <p className="font-semibold text-[#251710]">No Past Attempts Recorded Yet</p>
              <p className="text-xs text-[#8C7665] mt-1">Complete an adaptive quiz session to view your learning trajectory.</p>
            </div>
          ) : (
            <>
              {/* Progress Line Chart */}
              {history.length > 1 && (
                <div className="bg-[#FAF7F2] border border-[#E5D7C7] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-[#2E7D32]" />
                    <h4 className="text-sm font-bold text-[#251710]">Historical Ability & Accuracy Trend</h4>
                  </div>
                  <div className="h-48 w-full">
                    <Line data={lineData} options={lineOptions} />
                  </div>
                </div>
              )}

              {/* Table of Attempts */}
              <div className="border border-[#E5D7C7] rounded-2xl overflow-hidden bg-[#FAF7F2]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F5ECE1] border-b border-[#E5D7C7] text-[#4A3222] uppercase font-mono font-bold">
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5">Session Name</th>
                      <th className="p-3.5 text-center">Accuracy</th>
                      <th className="p-3.5 text-center">IRT Ability</th>
                      <th className="p-3.5 text-center">Streak</th>
                      <th className="p-3.5">Weak Topics Detected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADCCE]">
                    {history.map((rep) => {
                      const dateStr = new Date(rep.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <tr
                          key={rep.id}
                          onClick={() => onSelectAttempt && onSelectAttempt(rep)}
                          className="hover:bg-[#F2E7DC] cursor-pointer transition-colors"
                        >
                          <td className="p-3.5 font-mono text-[#6E5848] flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#8C7665]" />
                            <span>{dateStr}</span>
                          </td>
                          <td className="p-3.5 font-semibold text-[#251710]">
                            {rep.quizTitle}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold">
                            <span className={rep.rawAccuracy >= 70 ? 'text-[#2E7D32]' : 'text-[#D97706]'}>
                              {rep.rawAccuracy}%
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-mono text-[#7B4622] font-bold">
                            {rep.scaledAbilityScore}/100
                          </td>
                          <td className="p-3.5 text-center font-mono text-[#C45E28] font-bold">
                            {rep.maxStreak}🔥
                          </td>
                          <td className="p-3.5">
                            {rep.weakSubtopics && rep.weakSubtopics.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {rep.weakSubtopics.slice(0, 2).map((wt, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-[10px] font-bold">
                                    {wt}
                                  </span>
                                ))}
                                {rep.weakSubtopics.length > 2 && (
                                  <span className="text-[10px] text-[#8C7665]">+{rep.weakSubtopics.length - 2} more</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#2E7D32] text-[11px] font-bold">None flagged</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
