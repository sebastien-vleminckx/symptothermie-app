import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FertilityStatus from '../components/FertilityStatus';

interface CycleData {
  date: string;
  temperature: number;
  mucusType?: string;
  cycleDay: number;
}

interface CycleStats {
  currentCycleDay: number;
  averageTemperature: number;
  lastPeriodStart: string;
  estimatedOvulation: string;
  daysUntilNextPeriod: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState<'fertile' | 'infertile' | 'uncertain'>('uncertain');
  const [lastEntry, setLastEntry] = useState<CycleData | null>(null);
  const [stats] = useState<CycleStats>({
    currentCycleDay: 12,
    averageTemperature: 36.45,
    lastPeriodStart: '2026-04-05',
    estimatedOvulation: '2026-04-17',
    daysUntilNextPeriod: 16,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      const mockData: CycleData[] = [
        { date: new Date().toISOString().split('T')[0], temperature: 36.5, mucusType: 'creamy', cycleDay: 12 },
      ];
      
      const today = new Date().toISOString().split('T')[0];
      const entry = mockData.find(d => d.date === today);
      setLastEntry(entry || null);
      
      // Simple logic: if mucus is egg-white or watery, likely fertile
      if (entry?.mucusType === 'egg-white' || entry?.mucusType === 'watery') {
        setTodayStatus('fertile');
      } else if (entry?.mucusType === 'dry' || entry?.mucusType === 'sticky') {
        setTodayStatus('infertile');
      } else {
        setTodayStatus('fertile'); // Defaulting to fertile for demo
      }
      
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const quickActions = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      label: 'Add Entry',
      description: 'Log today',
      to: '/entry',
      color: 'from-rose-400 to-purple-400',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Calendar',
      description: 'View cycle',
      to: '/calendar',
      color: 'from-purple-400 to-indigo-400',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      label: 'Chart',
      description: 'Temperature',
      to: '/chart',
      color: 'from-sage-400 to-teal-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-rose-200 border-t-rose-400 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🌸</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in-up">
        <p className="text-warm-gray-500 font-medium mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-warm-gray-800">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},
          <span className="text-gradient ml-2">{user?.email?.split('@')[0] || 'Beautiful'}</span>
        </h1>
      </div>

      {/* Main Status Card */}
      <div className="mb-8 animate-fade-in-up stagger-1">
        <FertilityStatus status={todayStatus} />
      </div>

      {/* Cycle Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up stagger-2">
        <div className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <span className="text-xl">🌙</span>
            </div>
            <p className="text-sm text-warm-gray-500 font-medium">Cycle Day</p>
          </div>
          <p className="text-3xl font-bold text-warm-gray-800">{stats.currentCycleDay}</p>
          <p className="text-xs text-warm-gray-400 mt-1">Started Apr 5</p>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <span className="text-xl">🥚</span>
            </div>
            <p className="text-sm text-warm-gray-500 font-medium">Ovulation</p>
          </div>
          <p className="text-3xl font-bold text-warm-gray-800">~2 days</p>
          <p className="text-xs text-warm-gray-400 mt-1">Est. Apr 17</p>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-peach-100 flex items-center justify-center">
              <span className="text-xl">🌸</span>
            </div>
            <p className="text-sm text-warm-gray-500 font-medium">Next Period</p>
          </div>
          <p className="text-3xl font-bold text-warm-gray-800">{stats.daysUntilNextPeriod}</p>
          <p className="text-xs text-warm-gray-400 mt-1">Days away</p>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
              <span className="text-xl">🌡️</span>
            </div>
            <p className="text-sm text-warm-gray-500 font-medium">Avg Temp</p>
          </div>
          <p className="text-3xl font-bold text-warm-gray-800">{stats.averageTemperature.toFixed(2)}°C</p>
          <p className="text-xs text-warm-gray-400 mt-1">This cycle</p>
        </div>
      </div>

      {/* Today's Entry Preview */}
      {lastEntry && (
        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-warm-gray-800">Today's Entry</h3>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-600">
              Logged
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-warm-gray-50 rounded-xl p-4">
              <p className="text-xs text-warm-gray-500 uppercase tracking-wide mb-1">Temperature</p>
              <p className="text-2xl font-bold text-warm-gray-800">{lastEntry.temperature}°C</p>
            </div>
            <div className="bg-warm-gray-50 rounded-xl p-4">
              <p className="text-xs text-warm-gray-500 uppercase tracking-wide mb-1">Mucus</p>
              <p className="text-2xl font-bold text-warm-gray-800 capitalize">{lastEntry.mucusType}</p>
            </div>
            <div className="bg-warm-gray-50 rounded-xl p-4">
              <p className="text-xs text-warm-gray-500 uppercase tracking-wide mb-1">Cycle Day</p>
              <p className="text-2xl font-bold text-warm-gray-800">{lastEntry.cycleDay}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="animate-fade-in-up stagger-4">
        <h3 className="text-lg font-semibold text-warm-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={action.label}
              to={action.to}
              className="group relative overflow-hidden glass-card glass-card-hover rounded-2xl p-5 text-center"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>
              <p className="font-semibold text-warm-gray-800 mb-1">{action.label}</p>
              <p className="text-xs text-warm-gray-500">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 animate-fade-in-up stagger-5">
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-lavender-50 to-rose-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-warm-gray-800 mb-1">Daily Tip</h4>
              <p className="text-sm text-warm-gray-600">
                Take your temperature at the same time every morning, before getting out of bed, 
                for the most accurate readings. Consistency is key! 🌡️✨
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
