import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
      // Mock data for development
      setCalendarData(generateMockCalendarData(currentDate));
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      setCalendarData(generateMockCalendarData(currentDate));
    } finally {
      setLoading(false);
    }
  };

  const generateMockCalendarData = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data: CalendarDay[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      // dayOfWeek not used currently
      
      // Mock pattern: fertile mid-month, infertile at start/end
      let status: 'fertile' | 'infertile' | 'uncertain' | undefined;
      let hasData = day <= new Date().getDate();
      
      if (day >= 10 && day <= 16) {
        status = 'fertile';
      } else if (day >= 20 || day <= 5) {
        status = 'infertile';
      } else if (hasData) {
        status = 'uncertain';
      }

      data.push({
        date: dateStr,
        fertilityStatus: status,
        hasData,
        menstruation: day <= 5,
      });
    }
    return data;
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

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
            <h1 className="text-xl font-bold text-gray-800">Calendar</h1>
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
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
            ← Previous
          </button>
          <h2 className="text-xl font-semibold text-gray-800">{monthName}</h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 text-gray-600"
          >
            Next →
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
            <span className="text-gray-600">Uncertain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
            <span className="text-gray-600">No Data</span>
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
            <div className="p-8 text-center text-gray-500">Loading...</div>
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