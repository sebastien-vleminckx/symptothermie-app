import type { FC } from 'react';

interface FertilityStatusProps {
  status: 'fertile' | 'infertile' | 'uncertain' | null;
  date?: string;
}

const FertilityStatus: FC<FertilityStatusProps> = ({ status, date }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'fertile':
        return {
          gradient: 'from-rose-400 via-rose-500 to-rose-600',
          shadow: 'shadow-glow-rose',
          bgGradient: 'bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600',
          textColor: 'text-white',
          label: 'Fertile Window',
          emoji: '🌸',
          subtext: 'High fertility',
          description: 'You are in your fertile window. This is the best time to conceive.',
          iconBg: 'bg-rose-200/30',
        };
      case 'infertile':
        return {
          gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
          shadow: 'shadow-glow-sage',
          bgGradient: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600',
          textColor: 'text-white',
          label: 'Low Fertility',
          emoji: '🌿',
          subtext: 'Infertile phase',
          description: 'You are in a low fertility phase. Chance of conception is minimal.',
          iconBg: 'bg-emerald-200/30',
        };
      case 'uncertain':
        return {
          gradient: 'from-amber-400 via-amber-500 to-orange-500',
          shadow: 'shadow-glow-amber',
          bgGradient: 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500',
          textColor: 'text-white',
          label: 'Uncertain',
          emoji: '🔮',
          subtext: 'More data needed',
          description: 'Add more daily entries to get accurate fertility predictions.',
          iconBg: 'bg-amber-200/30',
        };
      default:
        return {
          gradient: 'from-slate-400 via-slate-500 to-slate-600',
          shadow: 'shadow-glow-slate',
          bgGradient: 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600',
          textColor: 'text-white',
          label: 'No Data',
          emoji: '📝',
          subtext: 'Start tracking',
          description: 'Add your first entry to begin tracking your fertility.',
          iconBg: 'bg-slate-200/30',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`relative overflow-hidden rounded-3xl p-8 ${config.bgGradient} ${config.shadow} animate-scale-in`}>
      {/* Animated background circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse-soft" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 animate-float" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 animate-shimmer pointer-events-none" />
      
      <div className="relative z-10">
        {/* Date badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <p className="text-sm font-medium text-white/90">
            {date || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Main status display */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                {config.subtext}
              </span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold text-white mb-4 tracking-tight">
              {config.label}
            </h2>
            <p className="text-lg text-white/90 max-w-md leading-relaxed">
              {config.description}
            </p>
          </div>
          
          {/* Large emoji icon */}
          <div className={`flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl ${config.iconBg} backdrop-blur-sm flex items-center justify-center animate-float`}>
            <span className="text-6xl sm:text-7xl">{config.emoji}</span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="mt-8 flex flex-wrap gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
            <span className="text-sm font-medium text-white">Cycle Day 12</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
            <span className="text-sm font-medium text-white">Ovulation ~2 days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FertilityStatus;
