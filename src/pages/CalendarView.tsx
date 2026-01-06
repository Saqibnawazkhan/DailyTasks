import { useState, useMemo } from 'react';
import { Task } from '../types/task';
import { getToday } from '../utils/date';

interface CalendarViewProps {
  tasks: Task[];
  onSelectDate: (date: string) => void;
}

export function CalendarView({ tasks, onSelectDate }: CalendarViewProps) {
  const today = getToday();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { daysInMonth, startDay, monthLabel } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return { daysInMonth, startDay, monthLabel };
  }, [currentMonth]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, { total: number; completed: number }> = {};
    for (const task of tasks) {
      if (!map[task.date]) {
        map[task.date] = { total: 0, completed: 0 };
      }
      map[task.date].total++;
      if (task.completed) map[task.date].completed++;
    }
    return map;
  }, [tasks]);

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const getDayInfo = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const date = `${year}-${month}-${dayStr}`;

    return {
      date,
      isToday: date === today,
      stats: tasksByDate[date] || null
    };
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const weekDaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/50">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevMonth}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">{monthLabel}</h2>
            <button
              onClick={goToCurrentMonth}
              className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-xl font-medium hover:bg-indigo-200 transition-colors"
            >
              Today
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        {/* Week days header */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
          {weekDays.map((day, index) => (
            <div key={index} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider" title={weekDaysFull[index]}>
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 border-b border-r border-gray-50 bg-gray-50/50" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const { date, isToday, stats } = getDayInfo(day);
            const completionPercent = stats ? Math.round((stats.completed / stats.total) * 100) : 0;

            return (
              <button
                key={day}
                onClick={() => onSelectDate(date)}
                className={`h-24 p-2 border-b border-r border-gray-50 text-left transition-all duration-300 flex flex-col relative group ${
                  isToday
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 ring-2 ring-indigo-300 ring-inset'
                    : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-indigo-50 hover:scale-[1.02] hover:z-10 hover:shadow-lg'
                }`}
              >
                <span className={`text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
                  isToday
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                }`}>
                  {day}
                </span>

                {stats && (
                  <div className="mt-auto space-y-1">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-medium ${
                        completionPercent === 100 ? 'text-emerald-600' :
                        completionPercent >= 50 ? 'text-indigo-600' :
                        'text-amber-600'
                      }`}>
                        {stats.completed}/{stats.total}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          completionPercent === 100
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                            : completionPercent >= 50
                              ? 'bg-gradient-to-r from-indigo-400 to-purple-400'
                              : 'bg-gradient-to-r from-amber-400 to-orange-400'
                        }`}
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white/60 backdrop-blur-sm py-4 px-6 rounded-2xl border border-white/50">
        <div className="flex justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>
            <span className="text-gray-600 font-medium">100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
            <span className="text-gray-600 font-medium">50%+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
            <span className="text-gray-600 font-medium">&lt;50%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
