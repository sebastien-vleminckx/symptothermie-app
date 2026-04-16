import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import FertilityStatus from '../components/FertilityStatus';
import { entriesApi, cycleApi, CycleEntry } from '../services/api';

interface CycleData {
  date: string;
  temperature: number;
  mucusType?: string;
  cycleDay: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState<'fertile' | 'infertile' | 'uncertain'>('uncertain');
  const [lastEntry, setLastEntry] = useState<CycleData | null>(null);
  const [stats, setStats] = useState({
    currentCycleDay: 0,
    averageTemperature: 0,
    lastPeriodStart: '',
    estimatedOvulation: '',
    daysUntilNextPeriod: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch entries and cycle summary from API
      const [entries, summary] = await Promise.all([
        entriesApi.getAll(),
        cycleApi.getSummary(),
      ]);

      // Calculate stats from entries
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = entries.find((e: CycleEntry) => e.date === today);
      
      if (todayEntry) {
        setLastEntry({
          date: todayEntry.date,
          temperature: todayEntry.temperature,
          mucusType: todayEntry.mucusType,
          cycleDay: summary.currentCycleDay,
        });
      } else {
        setLastEntry(null);
      }

      // Determine fertility status based on mucus type and API summary
      let status: 'fertile' | 'infertile' | 'uncertain' = summary.fertilityStatus;
      
      if (todayEntry?.mucusType) {
        if (todayEntry.mucusType === 'egg-white' || todayEntry.mucusType === 'watery') {
          status = 'fertile';
        } else if (todayEntry.mucusType === 'dry' || todayEntry.mucusType === 'sticky') {
          status = 'infertile';
        }
      }
      setTodayStatus(status);

      // Calculate average temperature from this cycle
      const cycleEntries = entries.filter((e: CycleEntry) => {
        const entryDate = new Date(e.date);
        const cycleStart = new Date();
        cycleStart.setDate(cycleStart.getDate() - summary.currentCycleDay);
        return entryDate >= cycleStart;
      });

      const avgTemp = cycleEntries.length > 0
        ? cycleEntries.reduce((sum: number, e: CycleEntry) => sum + e.temperature, 0) / cycleEntries.length
        : 0;

      setStats({
        currentCycleDay: summary.currentCycleDay,
        averageTemperature: avgTemp,
        lastPeriodStart: summary.estimatedOvulation 
          ? new Date(new Date(summary.estimatedOvulation).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : '',
        estimatedOvulation: summary.estimatedOvulation || '',
        daysUntilNextPeriod: summary.nextPeriod 
          ? Math.ceil((new Date(summary.nextPeriod).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      label: 'Nouvelle entrée',
      description: 'Enregistrer aujourd\'hui',
      to: '/entry',
      color: 'from-rose-400 to-purple-400',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Calendrier',
      description: 'Voir le cycle',
      to: '/calendar',
      color: 'from-purple-400 to-indigo-400',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      label: 'Graphique',
      description: 'Température',
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
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-warm-gray-800">
          {new Date().getHours() < 12 ? 'Bonjour' : new Date().getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'},
          <span className="text-gradient ml-2">{user?.email?.split('@')[0] || 'Belle'}</span>
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
            <p className="text-sm text-warm-gray-500 font-medium">Jour du cycle</p>
          </div>
          <p className="text-3xl font-bold text-warm-gray-800">{stats.currentCycleDay}</p>
          <p className="text-xs text-warm-gray-400 mt-1">Commencé le {stats.lastPeriodStart ? new Date(stats.lastPeriodStart).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }) : '-'}</p>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <span className="text-xl">🥚</span>
            </div>
            <p className="text-sm text-warm-gray-500 font-medium">Ovulation</p>
          </div>
          <p className="text-3xl font-bold text-warm-gray-800">
            {stats.estimatedOvulation 
              ? `~${Math.ceil((new Date(stats.estimatedOvulation).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} jours`
              : 'En attente'}
          </p>
          <p className="text-xs text-warm-gray-400 mt-1">
            {stats.estimatedOvulation 
              ? `Est. ${new Date(stats.estimatedOvulation).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}`
              : 'Plus de données nécessaires'}
          </p>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-peach-100 flex items-center justify-center">
              <span className="text-xl">🌸</span>
            </div>
            <p className="text-sm text-warm-gray-500 font-medium">Prochaines règles</p>
          </div>
          <p className="text-3xl font-bold text-warm-gray-800">{stats.daysUntilNextPeriod > 0 ? stats.daysUntilNextPeriod : '-'}</p>
          <p className="text-xs text-warm-gray-400 mt-1">{stats.daysUntilNextPeriod > 0 ? 'Jours restants' : 'En attente'}</p>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
              <span className="text-xl">🌡️</span>
            </div>
            <p className="text-sm text-warm-gray-500 font-medium">Temp. moyenne</p>
          </div>
          <p className="text-3xl font-bold text-warm-gray-800">{stats.averageTemperature > 0 ? stats.averageTemperature.toFixed(2) : '-'}°C</p>
          <p className="text-xs text-warm-gray-400 mt-1">Ce cycle</p>
        </div>
      </div>

      {/* Today's Entry Preview */}
      {lastEntry && (
        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-warm-gray-800">Entrée d'aujourd'hui</h3>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-600">
              Enregistré
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-warm-gray-50 rounded-xl p-4">
              <p className="text-xs text-warm-gray-500 uppercase tracking-wide mb-1">Température</p>
              <p className="text-2xl font-bold text-warm-gray-800">{lastEntry.temperature}°C</p>
            </div>
            <div className="bg-warm-gray-50 rounded-xl p-4">
              <p className="text-xs text-warm-gray-500 uppercase tracking-wide mb-1">Glaire</p>
              <p className="text-2xl font-bold text-warm-gray-800 capitalize">
                {lastEntry.mucusType === 'dry' ? 'Sèche' :
                 lastEntry.mucusType === 'sticky' ? 'Collante' :
                 lastEntry.mucusType === 'creamy' ? 'Crémeuse' :
                 lastEntry.mucusType === 'watery' ? 'Liquide' :
                 lastEntry.mucusType === 'egg-white' ? 'Blanc d\'œuf' : '-'}
              </p>
            </div>
            <div className="bg-warm-gray-50 rounded-xl p-4">
              <p className="text-xs text-warm-gray-500 uppercase tracking-wide mb-1">Jour du cycle</p>
              <p className="text-2xl font-bold text-warm-gray-800">{lastEntry.cycleDay}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="animate-fade-in-up stagger-4">
        <h3 className="text-lg font-semibold text-warm-gray-800 mb-4">Actions rapides</h3>
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
              <h4 className="font-semibold text-warm-gray-800 mb-1">Conseil du jour</h4>
              <p className="text-sm text-warm-gray-600">
                Prenez votre température à la même heure chaque matin, avant de sortir du lit, 
                pour les relevés les plus précis. La constance est la clé ! 🌡️✨
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
