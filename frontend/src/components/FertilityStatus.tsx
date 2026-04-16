import React from 'react';

interface FertilityStatusProps {
  status: 'fertile' | 'infertile' | 'uncertain' | null;
  date?: string;
}

export default function FertilityStatus({ status, date }: FertilityStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'fertile':
        return {
          bgColor: 'bg-red-600',
          textColor: 'text-white',
          label: 'Fertile',
          emoji: '🌸',
          description: 'High probability of conception',
        };
      case 'infertile':
        return {
          bgColor: 'bg-green-600',
          textColor: 'text-white',
          label: 'Infertile',
          emoji: '🌿',
          description: 'Low probability of conception',
        };
      case 'uncertain':
        return {
          bgColor: 'bg-yellow-500',
          textColor: 'text-gray-900',
          label: 'Uncertain',
          emoji: '⚠️',
          description: 'Insufficient data for prediction',
        };
      default:
        return {
          bgColor: 'bg-gray-400',
          textColor: 'text-white',
          label: 'No Data',
          emoji: '❓',
          description: 'Add today\'s entry to see status',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`rounded-2xl p-6 shadow-lg ${config.bgColor} ${config.textColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">
            {date || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-3xl font-bold">{config.label}</h2>
          <p className="text-sm opacity-90 mt-2">{config.description}</p>
        </div>
        <div className="text-5xl">{config.emoji}</div>
      </div>
    </div>
  );
}