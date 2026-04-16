import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { entriesApi, CycleEntry } from '../services/api';

interface ChartData {
  date: string;
  temperature: number;
  displayDate: string;
}

export function Chart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [coverLine, setCoverLine] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch real data from API
        const entries = await entriesApi.getChartData(30);
        
        // Transform entries into chart data
        const chartData: ChartData[] = entries
          .sort((a: CycleEntry, b: CycleEntry) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((entry: CycleEntry) => ({
            date: entry.date,
            temperature: entry.temperature,
            displayDate: new Date(entry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          }));
        
        setData(chartData);
        
        // Calculate cover line (highest of first 6 temps + 0.1)
        if (chartData.length >= 6) {
          const firstSix = chartData.slice(0, 6);
          const maxTemp = Math.max(...firstSix.map(d => d.temperature));
          setCoverLine(maxTemp + 0.1);
        }
      } catch (err) {
        setError('Échec du chargement des données du graphique');
        console.error('Chart data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement du graphique...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Graphique de température</h1>
        <div className="text-sm text-gray-500">
          {data.length} jours enregistrés
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin - 0.2', 'dataMax + 0.2']}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value.toFixed(2)}°C`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                formatter={(value: number) => [`${value.toFixed(2)}°C`, 'Température']}
              />
              {coverLine && (
                <ReferenceLine 
                  y={coverLine} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: 'Ligne de couverture', position: 'right', fill: '#ef4444' }}
                />
              )}
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#4f46e5" 
                strokeWidth={2}
                dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <h3 className="font-medium text-gray-900 mb-2">Guide du graphique</h3>
        <ul className="space-y-1">
          <li>• <span className="text-indigo-600 font-medium">Ligne bleue</span> : Votre température basale quotidienne</li>
          {coverLine && (
            <li>• <span className="text-red-600 font-medium">Ligne rouge en pointillés</span> : Ligne de couverture (référence pour détecter l'ovulation)</li>
          )}
          <li>• La température augmente généralement de 0,2-0,5°C après l'ovulation</li>
        </ul>
      </div>
    </div>
  );
}
