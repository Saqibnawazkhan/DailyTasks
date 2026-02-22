import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Flame, Trophy } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  completedDates: string[];
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#f43f5e', '#14b8a6', '#a855f7', '#3b82f6', '#ec4899'];
const EMOJIS = ['💧', '🏃', '📚', '🧘', '🍎', '💤', '✍️', '🎯', '🎸', '🌿'];

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

function getStreak(completedDates: string[]): number {
  const today = getToday();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (completedDates.includes(d.toISOString().split('T')[0])) streak++;
    else break;
  }
  return streak;
}

const INITIAL_HABITS: Habit[] = [
  { id: '1', name: 'Drink 8 glasses of water', emoji: '💧', color: '#3b82f6', completedDates: [] },
  { id: '2', name: 'Exercise 30 min', emoji: '🏃', color: '#22c55e', completedDates: [] },
  { id: '3', name: 'Read 20 pages', emoji: '📚', color: '#f59e0b', completedDates: [] },
];

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎯');
  const [newColor, setNewColor] = useState(COLORS[0]);

  const today = getToday();
  const last7 = getLast7Days();

  const toggleHabit = (id: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const has = h.completedDates.includes(date);
      return { ...h, completedDates: has ? h.completedDates.filter(d => d !== date) : [...h.completedDates, date] };
    }));
  };

  const addHabit = () => {
    if (!newName.trim()) return;
    setHabits(prev => [...prev, {
      id: Date.now().toString(),
      name: newName.trim(),
      emoji: newEmoji,
      color: newColor,
      completedDates: [],
    }]);
    setNewName(''); setShowAdd(false);
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const todayDone = habits.filter(h => h.completedDates.includes(today)).length;
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Habit Tracker</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500">{todayDone}/{habits.length} done today</p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Habit
        </button>
      </div>

      {/* Today's summary bar */}
      {habits.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white">
          <Trophy className="w-6 h-6 shrink-0 opacity-80" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Today's Progress</p>
            <div className="mt-1.5 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: habits.length > 0 ? `${(todayDone / habits.length) * 100}%` : '0%' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
          <span className="text-2xl font-black">{habits.length > 0 ? Math.round((todayDone / habits.length) * 100) : 0}%</span>
        </div>
      )}

      {/* Add habit form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{newEmoji}</span>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addHabit()}
                  placeholder="Habit name…"
                  autoFocus
                  className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewEmoji(e)} className={`text-lg p-1 rounded-lg transition-all ${newEmoji === e ? 'bg-indigo-100 dark:bg-indigo-900/40 scale-110' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{e}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)} className={`w-6 h-6 rounded-full border-2 transition-all ${newColor === c ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={addHabit} disabled={!newName.trim()} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all">Add</button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit rows */}
      <div className="space-y-3">
        {habits.map(habit => {
          const streak = getStreak(habit.completedDates);
          const doneToday = habit.completedDates.includes(today);
          return (
            <motion.div
              key={habit.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
              style={{ borderLeftColor: habit.color, borderLeftWidth: 3 }}
            >
              <span className="text-2xl shrink-0">{habit.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{habit.name}</p>
                {/* 7-day grid */}
                <div className="flex gap-1 mt-2">
                  {last7.map((date, i) => {
                    const done = habit.completedDates.includes(date);
                    const isToday = date === today;
                    return (
                      <button
                        key={date}
                        onClick={() => toggleHabit(habit.id, date)}
                        title={date}
                        className={`flex flex-col items-center gap-0.5 ${isToday ? 'scale-110' : ''}`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${done ? 'shadow-sm' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                          style={done ? { backgroundColor: habit.color } : undefined}
                        >
                          {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-[8px] text-gray-400">{dayLabels[i]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                  <Flame className="w-3.5 h-3.5" />{streak}
                </div>
              )}
              <button
                onClick={() => toggleHabit(habit.id, today)}
                className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${doneToday ? 'shadow-md' : 'border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300'}`}
                style={doneToday ? { backgroundColor: habit.color } : undefined}
              >
                {doneToday ? <Check className="w-4 h-4 text-white" strokeWidth={3} /> : <Check className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
              </button>
              <button onClick={() => deleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 dark:text-gray-600 hover:text-rose-500 rounded-lg transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="text-5xl mb-4">🌱</span>
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No habits yet</p>
          <p className="text-sm text-gray-400">Add your first habit to start tracking</p>
        </div>
      )}
    </div>
  );
}
