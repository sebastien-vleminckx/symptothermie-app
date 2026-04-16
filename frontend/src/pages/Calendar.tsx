import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cycleApi, CycleEntry } from '../services/api';

interface CalendarDay {
  date: string;
  fertilityStatus?: 'fertile' | 'infertile' | 'uncertain';
  hasData: boolean;
  menstruation?: boolean;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1; // API expects 1-12
      const year = currentDate.getFullYear();
      
      // Fetch real data from API
      const entries = await cycleApi.getCalendar(month, year);
      
      // Transform entries into calendar data
      const yearNum = currentDate.getFullYear();
      const monthNum = currentDate.getMonth();
      const daysInMonth = new Date(yearNum, monthNum + 1, 0).getDate();
      const data: CalendarDay[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const entry = entries.find((e: CycleEntry) => e.date === dateStr);
        
        let status: 'fertile' | 'infertile' | 'uncertain' | undefined;
        if (entry) {
          // Determine fertility status based on mucus type
          if (entry.mucusType === 'egg-white' || entry.mucusType === 'watery') {
            status = 'fertile';
          } else if (entry.mucusType === 'dry' || entry.mucusType === 'sticky') {
            status = 'infertile';
          } else {
            status = 'uncertain';
          }
        }

        data.push({
          date: dateStr,
          fertilityStatus: status,
          hasData: !!entry,
          menstruation: entry?.menstruation,
        });
      }
      
      setCalendarData(data);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      // Fallback to empty calendar
      const yearNum = currentDate.getFullYear();
      const monthNum = currentDate.getMonth();
      const daysInMonth = new Date(yearNum, monthNum + 1, 0).getDate();
      const data: CalendarDay[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        data.push({ date: dateStr, hasData: false });
      }
      setCalendarData(data);
    } finally {
      setLoading(false);
    }
  };

  const getDayColor = (day: CalendarDay) => {
    if (!day.hasData) return 'bg-gray-100 text-gray-400';
    switch (day.fertilityStatus) {
      case 'fertile': return 'bg-red-600 text-white';
      case 'infertile': return 'bg-green-600 text-white';
      case 'uncertain': return 'bg-yellow-500 text-gray-900';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  // Generate calendar grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const calendarGrid: (CalendarDay | null)[] = [];
  
  // Empty cells for days before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarGrid.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayData = calendarData.find(d => new Date(d.date).getDate() === day);
    calendarGrid.push(dayData || { date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`, hasData: false });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">Calendrier</h1>
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Retour au tableau de bord
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 text-gray-600"
          >
            ← Précédent
          </button>
          <h2 className="text-xl font-semibold text-gray-800 capitalize">{monthName}</h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 text-gray-600"
          >
            Suivant →
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-600"></div>
            <span className="text-gray-600">Fertile</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span className="text-gray-600">Infertile</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-gray-600">Incertain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
            <span className="text-gray-600">Pas de données</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {weekDays.map(day => (
              <div key={day} className="py-3 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          {loading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : (
            <div className="grid grid-cols-7">
              {calendarGrid.map((day, index) => (
                <div
                  key={index}
                  className={`aspect-square border-b border-r border-gray-100 p-2 ${
                    day ? getDayColor(day) : ''
                  }`}
                >
                  {day && (
                    <div className="h-full flex flex-col items-center justify-center">
                      <span className="text-lg font-medium">
                        {new Date(day.date).getDate()}
                      </span>
                      {day.menstruation && <span className="text-xs">🩸</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
