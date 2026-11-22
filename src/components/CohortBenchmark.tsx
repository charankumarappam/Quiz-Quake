import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Users, TrendingUp, Award } from 'lucide-react';
import { CohortPoint } from '../../shared/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface CohortBenchmarkProps {
  userAccuracy: number;
  cohortPercentile: number;
  cohortComparison: {
    userScore: number;
    cohortMean: number;
    topTenThreshold: number;
    distribution: CohortPoint[];
  };
}

export const CohortBenchmark: React.FC<CohortBenchmarkProps> = ({
  userAccuracy,
  cohortPercentile,
  cohortComparison,
}) => {
  const chartData = {
    labels: cohortComparison.distribution.map(d => d.scoreBand),
    datasets: [
      {
        label: '% of Test Takers',
        data: cohortComparison.distribution.map(d => d.percentageStudents),
        backgroundColor: cohortComparison.distribution.map(d =>
          d.isUserBand ? 'rgba(123, 70, 34, 0.95)' : 'rgba(215, 195, 175, 0.65)'
        ),
        borderColor: cohortComparison.distribution.map(d =>
          d.isUserBand ? 'rgba(90, 50, 24, 1)' : 'rgba(190, 168, 148, 0.8)'
        ),
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6E5848', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(215, 195, 175, 0.4)' },
        ticks: { color: '#8C7665', font: { size: 9 }, callback: (v: any) => `${v}%` },
      },
    },
    plugins: {
      legend: { display: false },
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
    <div className="bg-white border border-[#E5D7C7] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#4A3224]/5">
      <div className="flex items-center justify-between pb-4 border-b border-[#EADCCE]">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-[#EBDDCB] border border-[#DAC5AF] text-[#633B1D]">
            <Users className="w-5 h-5 text-[#7B4622]" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#251710] text-lg">Cohort Percentile Benchmark</h4>
            <p className="text-xs text-[#7A6455]">Comparative percentile distribution against 1,500+ candidates</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EBDDCB] border border-[#DAC5AF] text-[#633B1D] font-mono text-xs font-bold shadow-sm">
          <TrendingUp className="w-3.5 h-3.5 text-[#7B4622]" />
          <span>{cohortPercentile}th Percentile</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-5">
        <div className="bg-[#FAF7F2] border border-[#E5D7C7] rounded-2xl p-4 text-center shadow-sm">
          <span className="text-xs font-bold text-[#7A6455] uppercase tracking-wider font-mono">Your Accuracy</span>
          <p className="text-2xl font-mono font-extrabold text-[#7B4622] mt-1">{userAccuracy}%</p>
        </div>
        <div className="bg-[#FAF7F2] border border-[#E5D7C7] rounded-2xl p-4 text-center shadow-sm">
          <span className="text-xs font-bold text-[#7A6455] uppercase tracking-wider font-mono">Batch Median</span>
          <p className="text-2xl font-mono font-extrabold text-[#251710] mt-1">{cohortComparison.cohortMean}%</p>
        </div>
        <div className="bg-[#FAF7F2] border border-[#E5D7C7] rounded-2xl p-4 text-center shadow-sm">
          <span className="text-xs font-bold text-[#7A6455] uppercase tracking-wider font-mono">Top 10% Cutoff</span>
          <p className="text-2xl font-mono font-extrabold text-[#B87A42] mt-1">{cohortComparison.topTenThreshold}%</p>
        </div>
      </div>

      {/* Graph Area with clean pure white background */}
      <div className="h-48 w-full mt-2 p-3 bg-white rounded-2xl border border-[#F0E6DA]">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <p className="text-xs text-[#6B5546] mt-4 text-center font-medium">
        {userAccuracy >= cohortComparison.topTenThreshold ? (
          <span className="text-[#8C530A] font-bold">
            Outstanding! You outperformed {cohortPercentile}% of all simulated engineering candidates.
          </span>
        ) : (
          <span>
            You placed higher than <strong className="text-[#7B4622] font-bold">{cohortPercentile}%</strong> of peers across 1,500+ standardized attempts.
          </span>
        )}
      </p>
    </div>
  );
};
