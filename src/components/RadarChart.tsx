import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { TopicDiagnostic } from '../../shared/types';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  topicDiagnostics: TopicDiagnostic[];
}

export const WeakTopicRadarChart: React.FC<RadarChartProps> = ({ topicDiagnostics }) => {
  const labels = topicDiagnostics.map(t => t.topic);
  const dataValues = topicDiagnostics.map(t => t.accuracy);
  const benchmarkValues = topicDiagnostics.map(() => 60); // 60% threshold for critical deficiency

  const data = {
    labels,
    datasets: [
      {
        label: 'Student Topic Mastery (%)',
        data: dataValues,
        backgroundColor: 'rgba(123, 70, 34, 0.25)',
        borderColor: 'rgba(123, 70, 34, 1)',
        borderWidth: 2.5,
        pointBackgroundColor: 'rgba(184, 122, 66, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(123, 70, 34, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Deficiency Threshold (60%)',
        data: benchmarkValues,
        backgroundColor: 'rgba(196, 68, 68, 0.06)',
        borderColor: 'rgba(196, 68, 68, 0.7)',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(215, 195, 175, 0.6)',
        },
        grid: {
          color: 'rgba(215, 195, 175, 0.5)',
        },
        pointLabels: {
          color: '#2B1D15',
          font: {
            size: 11,
            family: "'Plus Jakarta Sans', sans-serif",
            weight: 700 as const,
          },
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          color: '#8C7665',
          backdropColor: 'transparent',
          font: {
            size: 9,
            family: "'JetBrains Mono', monospace",
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          font: {
            size: 11,
            family: "'Plus Jakarta Sans', sans-serif",
          },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.raw;
            return ` ${label}: ${value}%`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-72 sm:h-80 relative flex items-center justify-center">
      <Radar data={data} options={options} />
    </div>
  );
};
