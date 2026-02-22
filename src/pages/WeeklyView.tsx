import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Task } from '../types/task';
import { formatDate, getToday } from '../utils/date';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

interface WeeklyViewProps {
  tasks: Task[];
  onToggle: (id: string) => void;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyView({ tasks, onToggle }: WeeklyViewProps) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const today = getToday();
  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const goToday  = () => setWeekStart(getWeekStart(new Date()));

  const weekLabel = `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    days.forEach(d => { map[formatDate(d)] = []; });
    tasks.forEach(t => { if (map[t.date]) map[t.date].push(t); });
    return map;
  }, [tasks, days]);

  const totalWeek = days.reduce((sum, d) => sum + (tasksByDay[formatDate(d)]?.length ?? 0), 0);
  const doneWeek  = days.reduce((sum, d) => sum + (tasksByDay[formatDate(d)]?.filter(t => t.completed).length ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center">
          <h2 className="font-bold text-gray-900 dark:text-white">{weekLabel}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{doneWeek}/{totalWeek} tasks completed this week</p>
        </div>
        <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button onClick={goToday} className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
          This week
        </button>
      </div>

      {/* Week progress bar */}
      {totalWeek > 0 && (
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${Math.round((doneWeek / totalWeek) * 100)}%` }} />
        </div>
      )}

      {/* Day columns */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const dateStr = formatDate(day);
          const dayTasks = tasksByDay[dateStr] ?? [];
          const done = dayTasks.filter(t => t.completed).length;
          const isToday = dateStr === today;

          return (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`flex flex-col rounded-2xl border p-2 min-h-28 ${
                isToday
                  ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/20'
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
              }`}
            >
              {/* Day header */}
              <div className={`text-center mb-2 ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <p className="text-[10px] font-bold uppercase tracking-wide">{DAY_LABELS[idx]}</p>
                <p className={`text-lg font-bold leading-none ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {day.getDate()}
                </p>
              </div>

              {/* Tasks */}
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayTasks.slice(0, 4).map(task => (
                  <button
                    key={task.id}
                    onClick={() => onToggle(task.id)}
                    className={`w-full flex items-center gap-1 text-left group/t rounded-lg px-1.5 py-1 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ${task.completed ? 'opacity-50' : ''}`}
                  >
                    {task.completed
                      ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      : <Circle className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover/t:text-indigo-400 shrink-0" />
                    }
                    <span className={`text-[10px] leading-tight truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {task.title}
                    </span>
                  </button>
                ))}
                {dayTasks.length > 4 && (
                  <p className="text-[10px] text-gray-400 text-center">+{dayTasks.length - 4} more</p>
                )}
              </div>

              {/* Count badge */}
              {dayTasks.length > 0 && (
                <div className="mt-2 text-center">
                  <span className={`text-[10px] font-semibold ${done === dayTasks.length ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {done}/{dayTasks.length}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
