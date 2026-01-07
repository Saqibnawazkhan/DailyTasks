import { useState, useCallback, ReactNode, useMemo, useEffect, useRef } from 'react';
import { useTasks } from './hooks/useTasks';
import { DailyView } from './pages/DailyView';
import { CalendarView } from './pages/CalendarView';
import { MonthlyReport } from './pages/MonthlyReport';
import { getToday } from './utils/date';

type View = 'today' | 'calendar' | 'report';

function App() {
  const [currentView, setCurrentView] = useState<View>('today');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { tasks, isLoaded, error, addTask, updateTask, toggleTask, deleteTask, getTasksByDate, clearError } = useTasks();

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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '1') setCurrentView('today');
      if (e.key === '2') setCurrentView('calendar');
      if (e.key === '3') setCurrentView('report');
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

  // Show loading screen with fun animation
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl animate-spin-slow"></div>
            <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 font-medium text-lg">Loading TaskFlow</p>
          <div className="flex justify-center gap-1 mt-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    );
  }

  const navItems: { id: View; label: string; icon: ReactNode }[] = [
    {
      id: 'today',
      label: 'Tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'report',
      label: 'Stats',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform animate-gradient" onClick={() => setCurrentView('today')}>
                <div className="relative">
                  <svg className="w-7 h-7 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div className="absolute inset-0 bg-indigo-400 blur-lg opacity-30 animate-pulse"></div>
                </div>
                TaskFlow
              </h1>
              {tasks.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <span className="text-sm text-gray-600">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
                  <span className="text-xs text-indigo-500 font-medium">done</span>
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex gap-1 bg-gray-100/80 p-1.5 rounded-2xl">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                    currentView === item.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <span className={`transition-transform duration-300 ${currentView === item.id ? 'scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                  {item.id === 'today' && todayTaskCount > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center animate-pulse ${
                      currentView === item.id ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {todayTaskCount > 9 ? '9+' : todayTaskCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-4 animate-slide-in-right">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg shadow-rose-100/50">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-red-100 rounded-xl flex items-center justify-center flex-shrink-0 animate-shake">
              <span className="text-xl">⚠️</span>
            </div>
            <p className="text-sm text-rose-700 flex-1 font-medium">{error}</p>
            <button onClick={clearError} className="p-2 hover:bg-rose-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95">
              <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-6">
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
        {currentView === 'calendar' && (
          <CalendarView
            tasks={tasks}
            onSelectDate={handleSelectDateFromCalendar}
          />
        )}
        {currentView === 'report' && (
          <MonthlyReport tasks={tasks} />
        )}
      </main>

      {/* Footer */}
      <footer className="hidden sm:block max-w-5xl mx-auto px-4 pb-6 relative z-10">
        <div className="text-center text-sm text-gray-400 pt-8 border-t border-gray-200/50">
          <div className="flex items-center justify-center gap-6 mb-2">
            <span className="flex items-center gap-2 hover:text-indigo-500 transition-colors cursor-default">
              <span className="text-lg">⚡</span> TaskFlow v2.0
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              Press <kbd className="px-2 py-1 bg-white/80 rounded-lg text-indigo-600 font-mono text-xs shadow-sm border">1</kbd>
              <kbd className="px-2 py-1 bg-white/80 rounded-lg text-indigo-600 font-mono text-xs shadow-sm border">2</kbd>
              <kbd className="px-2 py-1 bg-white/80 rounded-lg text-indigo-600 font-mono text-xs shadow-sm border">3</kbd> to navigate
            </span>
          </div>
          <p className="text-xs text-gray-400">Made with ❤️ for productivity lovers</p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 z-40 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce-once flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Mobile Navigation */}
      <nav className="sm:hidden fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-gray-200/50 z-30">
        <div className="flex justify-around py-3 px-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`relative flex flex-col items-center gap-1 py-2 px-5 rounded-2xl transition-all duration-300 ${
                currentView === item.id
                  ? 'text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-200 scale-105'
                  : 'text-gray-500 hover:text-gray-700 active:scale-95'
              }`}
            >
              <span className={`transition-transform duration-300 ${currentView === item.id ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className="text-xs font-semibold">{item.label}</span>
              {item.id === 'today' && todayTaskCount > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center animate-bounce ${
                  currentView === item.id ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white'
                }`}>
                  {todayTaskCount > 9 ? '9+' : todayTaskCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
