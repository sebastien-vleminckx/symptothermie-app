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
// API import removed - using mock data for now

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
        // TODO: Replace with actual API call
        // const response = await api.get('/entries/chart');
        
        // Mock data for demonstration
        const mockData: ChartData[] = [
          { date: '2026-04-01', temperature: 36.2, displayDate: 'Apr 1' },
          { date: '2026-04-02', temperature: 36.15, displayDate: 'Apr 2' },
          { date: '2026-04-03', temperature: 36.25, displayDate: 'Apr 3' },
          { date: '2026-04-04', temperature: 36.3, displayDate: 'Apr 4' },
          { date: '2026-04-05', temperature: 36.2, displayDate: 'Apr 5' },
          { date: '2026-04-06', temperature: 36.35, displayDate: 'Apr 6' },
          { date: '2026-04-07', temperature: 36.4, displayDate: 'Apr 7' },
          { date: '2026-04-08', temperature: 36.45, displayDate: 'Apr 8' },
          { date: '2026-04-09', temperature: 36.5, displayDate: 'Apr 9' },
          { date: '2026-04-10', temperature: 36.55, displayDate: 'Apr 10' },
          { date: '2026-04-11', temperature: 36.6, displayDate: 'Apr 11' },
          { date: '2026-04-12', temperature: 36.65, displayDate: 'Apr 12' },
          { date: '2026-04-13', temperature: 36.7, displayDate: 'Apr 13' },
          { date: '2026-04-14', temperature: 36.75, displayDate: 'Apr 14' },
          { date: '2026-04-15', temperature: 36.8, displayDate: 'Apr 15' },
        ];
        
        setData(mockData);
        
        // Calculate cover line (highest of first 6 temps + 0.1)
        if (mockData.length >= 6) {
          const firstSix = mockData.slice(0, 6);
          const maxTemp = Math.max(...firstSix.map(d => d.temperature));
          setCoverLine(maxTemp + 0.1);
        }
      } catch (err) {
        setError('Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading chart...</div>
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
        <h1 className="text-2xl font-bold text-gray-900">Temperature Chart</h1>
        <div className="text-sm text-gray-500">
          {data.length} days recorded
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
                formatter={(value: number) => [`${value.toFixed(2)}°C`, 'Temperature']}
              />
              {coverLine && (
                <ReferenceLine 
                  y={coverLine} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: 'Cover Line', position: 'right', fill: '#ef4444' }}
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
        <h3 className="font-medium text-gray-900 mb-2">Chart Guide</h3>
        <ul className="space-y-1">
          <li>• <span className="text-indigo-600 font-medium">Blue line</span>: Your daily basal body temperature</li>
          {coverLine && (
            <li>• <span className="text-red-600 font-medium">Red dashed line</span>: Cover line (baseline for detecting ovulation)</li>
          )}
          <li>• Temperature typically rises 0.2-0.5°C after ovulation</li>
        </ul>
      </div>
    </div>
  );
}
