import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Using simple text labels instead of heroicons

interface CycleData {
  date: string;
  temperature: number;
  mucusType?: string;
}

export function Dashboard() {
  const [todayStatus, setTodayStatus] = useState<'fertile' | 'infertile' | 'uncertain'>('uncertain');
  const [lastEntry, setLastEntry] = useState<CycleData | null>(null);

  useEffect(() => {
    // TODO: Fetch actual data from API
    // For now, simulate based on mock data
    const mockData: CycleData[] = [
      { date: new Date().toISOString().split('T')[0], temperature: 36.5, mucusType: 'sticky' },
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
      setTodayStatus('uncertain');
    }
  }, []);

  const getStatusColor = () => {
    switch (todayStatus) {
      case 'fertile':
        return 'bg-red-600';
      case 'infertile':
        return 'bg-green-600';
      case 'uncertain':
        return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (todayStatus) {
      case 'fertile':
        return 'Fertile';
      case 'infertile':
        return 'Infertile';
      case 'uncertain':
        return 'Uncertain';
    }
  };

  const getStatusDescription = () => {
    switch (todayStatus) {
      case 'fertile':
        return 'High probability of fertility today. Use protection if avoiding pregnancy.';
      case 'infertile':
        return 'Low probability of fertility today.';
      case 'uncertain':
        return 'Not enough data to determine fertility status. Add an entry!';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Today's Status</h1>
      
      {/* Status Card */}
      <div className={`${getStatusColor()} rounded-2xl p-8 text-white shadow-lg`}>
        <div className="text-center">
          <p className="text-lg opacity-90 mb-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h2 className="text-4xl font-bold mb-4">{getStatusText()}</h2>
          <p className="text-sm opacity-90 max-w-md mx-auto">{getStatusDescription()}</p>
        </div>
      </div>

      {/* Quick Stats */}
      {lastEntry && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Entry</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="text-2xl font-bold text-gray-900">{lastEntry.temperature}°C</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Mucus</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{lastEntry.mucusType}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          to="/entry"
          className="flex flex-col items-center justify-center bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl mb-2">+</span>
          <span className="text-sm font-medium text-gray-900">Add Entry</span>
        </Link>
        <Link
          to="/calendar"
          className="flex flex-col items-center justify-center bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl mb-2">📅</span>
          <span className="text-sm font-medium text-gray-900">Calendar</span>
        </Link>
        <Link
          to="/chart"
          className="flex flex-col items-center justify-center bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl mb-2">📊</span>
          <span className="text-sm font-medium text-gray-900">Chart</span>
        </Link>
      </div>
    </div>
  );
}
