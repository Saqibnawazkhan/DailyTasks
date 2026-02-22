import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Task } from '../types/task';
import { getToday } from '../utils/date';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onSelectDate: (date: string) => void;
}

function getHeatColor(pct: number): string {
  if (pct === 100) return 'bg-emerald-400 dark:bg-emerald-500';
  if (pct >= 75)   return 'bg-indigo-400 dark:bg-indigo-500';
  if (pct >= 50)   return 'bg-indigo-300 dark:bg-indigo-600';
  if (pct >= 25)   return 'bg-amber-300 dark:bg-amber-600';
  return 'bg-rose-300 dark:bg-rose-700';
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
    // Make week start on Monday: shift Sunday (0) → 6
    const rawStart = new Date(year, month, 1).getDay();
    const startDay = rawStart === 0 ? 6 : rawStart - 1;
    const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return { daysInMonth, startDay, monthLabel };
  }, [currentMonth]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, { total: number; completed: number }> = {};
    for (const task of tasks) {
      if (!map[task.date]) map[task.date] = { total: 0, completed: 0 };
      map[task.date].total++;
      if (task.completed) map[task.date].completed++;
    }
    return map;
  }, [tasks]);

  const getDayDate = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-${String(day).padStart(2, '0')}`;
  };

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const monthSummary = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}`;
    const monthTasks = tasks.filter(t => t.date.startsWith(prefix));
    const done = monthTasks.filter(t => t.completed).length;
    return { total: monthTasks.length, done };
  }, [tasks, currentMonth]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center">
          <h2 className="font-bold text-gray-900 dark:text-white">{monthLabel}</h2>
          {monthSummary.total > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{monthSummary.done}/{monthSummary.total} tasks completed</p>
          )}
        </div>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => { const n = new Date(); setCurrentMonth(new Date(n.getFullYear(), n.getMonth(), 1)); }}
          className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
          Today
        </button>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800">
          {DAY_LABELS.map(d => (
            <div key={d} className="py-2.5 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`e-${i}`} className="h-20 border-b border-r border-gray-50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-800/20" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = getDayDate(day);
            const isToday = date === today;
            const isPast = date < today;
            const stats = tasksByDate[date];
            const pct = stats ? Math.round((stats.completed / stats.total) * 100) : 0;

            return (
              <motion.button
                key={day}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectDate(date)}
                className={`h-20 p-2 border-b border-r border-gray-50 dark:border-gray-800/50 flex flex-col relative text-left transition-colors ${
                  isToday ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-inset ring-indigo-400' :
                  isPast && stats ? 'bg-gray-50/50 dark:bg-gray-800/20' :
                  'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                }`}
              >
                {/* Day number */}
                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {day}
                </span>

                {/* Heatmap dot + count */}
                {stats && (
                  <div className="mt-auto flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getHeatColor(pct)}`} />
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                        {stats.completed}/{stats.total}
                      </span>
                    </div>
                    <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getHeatColor(pct)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> 100%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" /> 50–99%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" /> 1–49%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-300 inline-block" /> Overdue</span>
      </div>
    </div>
  );
}
