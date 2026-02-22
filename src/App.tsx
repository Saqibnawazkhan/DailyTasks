import { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTasks } from './hooks/useTasks';
import { DailyView } from './pages/DailyView';
import { CalendarView } from './pages/CalendarView';
import { MonthlyReport } from './pages/MonthlyReport';
import { KanbanView } from './pages/KanbanView';
import { WeeklyView } from './pages/WeeklyView';
import { getToday } from './utils/date';
import { CheckCircle, Calendar, BarChart3, Zap, ChevronUp, AlertTriangle, X, Sun, Moon, Monitor, Kanban, Timer, Download, Upload, Focus, CalendarDays, Plus } from 'lucide-react';
import { useThemeStore } from './store/themeStore';
import { CommandPalette } from './components/CommandPalette';
import { PomodoroTimer } from './components/PomodoroTimer';
import { FocusMode } from './components/FocusMode';
import { ShortcutsModal } from './components/ShortcutsModal';
import { useSettingsStore } from './store/settingsStore';

type View = 'today' | 'kanban' | 'weekly' | 'calendar' | 'report';

function App() {
  const [currentView, setCurrentView] = useState<View>('today');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { tasks, isLoaded, error, addTask, updateTask, toggleTask, deleteTask, getTasksByDate, clearError, exportTasks, importTasks } = useTasks();
  const { theme, setTheme } = useThemeStore();
  const { soundEnabled, setSoundEnabled } = useSettingsStore();

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') { e.preventDefault(); setCmdOpen(v => !v); return; }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '1') setCurrentView('today');
      if (e.key === '2') setCurrentView('kanban');
      if (e.key === '3') setCurrentView('calendar');
      if (e.key === '4') setCurrentView('report');
      // Quick add shortcut - 'n' for new task
      if (e.key === 'n' || e.key === 'N') {
        setCurrentView('today');
        setTimeout(() => {
          const input = document.querySelector('input[placeholder*="Enter your task"]') as HTMLInputElement;
          if (input) input.focus();
        }, 100);
      }
      if (e.key === '?') setShortcutsOpen(v => !v);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectDateFromCalendar = useCallback((_date: string) => {
    setCurrentView('today');
  }, []);

  const todayTaskCount = useMemo(() => {
    const today = getToday();
    return tasks.filter(t => t.date === today && !t.completed).length;
  }, [tasks]);

  const streak = useMemo(() => {
    const today = getToday();
    let s = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => t.date === dateStr);
      if (dayTasks.length === 0) { if (i === 0) continue; break; }
      if (dayTasks.every(t => t.completed)) s++;
      else break;
    }
    return s;
  }, [tasks]);

  // Update page title with task count
  useEffect(() => {
    if (todayTaskCount > 0) {
      document.title = `(${todayTaskCount}) TaskFlow - Beautiful Task Manager`;
    } else {
      document.title = 'TaskFlow - Beautiful Task Manager';
    }
  }, [todayTaskCount]);

  // Show loading screen
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500"
            />
            <div className="absolute inset-1.5 bg-gray-950 rounded-2xl flex items-center justify-center">
              <Zap className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">TaskFlow</h1>
          <p className="text-gray-500 text-sm">Loading your workspace…</p>
          <div className="flex justify-center gap-1.5 mt-6">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                className="w-2 h-2 bg-indigo-500 rounded-full inline-block"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Tasks', icon: <CheckCircle className="w-5 h-5" /> },
    { id: 'kanban', label: 'Board', icon: <Kanban className="w-5 h-5" /> },
    { id: 'weekly', label: 'Week', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: 'report', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> }
  ];

  const themeIcons = { light: <Sun className="w-4 h-4" />, dark: <Moon className="w-4 h-4" />, system: <Monitor className="w-4 h-4" /> };
  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white leading-none">TaskFlow</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">v3.0</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'today' && todayTaskCount > 0 && (
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                  currentView === item.id ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
                }`}>{todayTaskCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Productivity score */}
        {tasks.length > 0 && (() => {
          const done = tasks.filter(t => t.completed).length;
          const total = tasks.length;
          const pct = Math.round((done / total) * 100);
          const highDone = tasks.filter(t => t.completed && t.priority === 'high').length;
          const highTotal = tasks.filter(t => t.priority === 'high').length;
          const score = Math.min(100, Math.round(pct * 0.6 + (highTotal > 0 ? (highDone / highTotal) * 100 * 0.4 : pct * 0.4)));
          const grade = score >= 90 ? 'S' : score >= 75 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';
          const gradeColor = score >= 90 ? 'text-emerald-500' : score >= 75 ? 'text-indigo-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500';
          return (
            <div className="px-4 py-3 mx-3 mb-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Productivity Score</p>
                <span className={`text-lg font-black ${gradeColor}`}>{grade}</span>
              </div>
              <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{score}<span className="text-xs font-medium text-indigo-400">/100</span></p>
              <div className="mt-2 h-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${score}%` }} />
              </div>
              <p className="text-[10px] text-indigo-400 mt-1">{done}/{total} tasks · {highDone}/{highTotal || 0} high-priority</p>
            </div>
          );
        })()}

        {/* Streak */}
        {streak > 0 && (
          <div className="px-4 py-2.5 mx-3 mb-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 flex items-center gap-3">
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{streak}-day streak</p>
              <p className="text-[10px] text-amber-500 dark:text-amber-500">Keep it up!</p>
            </div>
          </div>
        )}

        {/* Export / Import */}
        <div className="px-3 pb-2 flex gap-2">
          <button
            onClick={exportTasks}
            title="Export tasks as JSON"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <label
            title="Import tasks from JSON"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" /> Import
            <input type="file" accept=".json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { importTasks(f); e.target.value = ''; } }} />
          </label>
        </div>

        {/* Sound toggle */}
        <div className="px-3 pb-2 flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              soundEnabled ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}
          >
            {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
          </button>
        </div>

        {/* Theme toggle */}
        <div className="px-3 pb-4 flex items-center gap-2">
          {(['light', 'dark', 'system'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              title={`${t} mode`}
              className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-medium transition-all ${
                theme === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t === 'light' ? <Sun className="w-3.5 h-3.5" /> : t === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </aside>

      {/* Right column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar — mobile header + desktop title bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-lg capitalize">
            {currentView === 'today' ? 'My Tasks' : currentView === 'kanban' ? 'Board' : currentView === 'weekly' ? 'Weekly View' : currentView === 'calendar' ? 'Calendar' : 'Statistics'}
          </h2>
          <div className="flex items-center gap-2">
            {/* Focus mode toggle */}
            <button
              onClick={() => setFocusOpen(true)}
              title="Focus Mode"
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-110"
            >
              <Focus className="w-4 h-4" />
            </button>
            {/* Pomodoro toggle */}
            <button
              onClick={() => setPomodoroOpen(v => !v)}
              title="Pomodoro Timer"
              className={`p-2 rounded-lg transition-all hover:scale-110 ${pomodoroOpen ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              <Timer className="w-4 h-4" />
            </button>
            {/* Mobile theme toggle */}
            <button
              onClick={() => setTheme(nextTheme)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:scale-110 transition-all"
            >
              {themeIcons[theme]}
            </button>
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-300 flex-1">{error}</p>
            <button onClick={clearError} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors">
              <X className="w-4 h-4 text-rose-500" />
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {currentView === 'today' && (
                  <DailyView
                    tasks={tasks}
                    getTasksByDate={getTasksByDate}
                    onAddTask={addTask}
                    onToggle={toggleTask}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                  />
                )}
                {currentView === 'kanban' && (
                  <KanbanView
                    tasks={tasks}
                    onToggle={toggleTask}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                  />
                )}
                {currentView === 'weekly' && (
                  <WeeklyView tasks={tasks} onToggle={toggleTask} />
                )}
                {currentView === 'calendar' && (
                  <CalendarView tasks={tasks} onSelectDate={handleSelectDateFromCalendar} />
                )}
                {currentView === 'report' && (
                  <MonthlyReport tasks={tasks} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile FAB — quick add */}
        {currentView === 'today' && (
          <button
            onClick={() => {
              setTimeout(() => {
                const input = document.querySelector('input[placeholder*="What needs to be done"]') as HTMLInputElement;
                if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
              }, 100);
            }}
            className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
            aria-label="Add task"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* Scroll to top */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-30 flex">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-200 ${
              currentView === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-500'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-semibold">{item.label}</span>
            {item.id === 'today' && todayTaskCount > 0 && (
              <span className="absolute top-2 right-[calc(33%-8px)] w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {todayTaskCount > 9 ? '9+' : todayTaskCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Focus Mode */}
      <AnimatePresence>
        {focusOpen && <FocusMode tasks={tasks} onClose={() => setFocusOpen(false)} onToggle={toggleTask} />}
      </AnimatePresence>

      {/* Shortcuts Modal */}
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Pomodoro Timer */}
      <AnimatePresence>
        {pomodoroOpen && <PomodoroTimer onClose={() => setPomodoroOpen(false)} />}
      </AnimatePresence>

      {/* Command Palette */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        tasks={tasks}
        onNavigate={(view) => setCurrentView(view as View)}
        onToggleTask={toggleTask}
      />
    </div>
  );
}

export default App;
