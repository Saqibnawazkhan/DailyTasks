import { useState, useMemo } from 'react';
import { Task, TaskFormData } from '../types/task';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { getToday, formatDisplayDate } from '../utils/date';

// Get greeting based on time of day
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', emoji: '🌅' };
  if (hour < 17) return { text: 'Good afternoon', emoji: '☀️' };
  if (hour < 21) return { text: 'Good evening', emoji: '🌆' };
  return { text: 'Good night', emoji: '🌙' };
}

interface DailyViewProps {
  tasks: Task[];
  getTasksByDate: (date: string) => Task[];
  onAddTask: (data: TaskFormData) => void;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskFormData>) => void;
  onDelete: (id: string) => void;
}

export function DailyView({ getTasksByDate, onAddTask, onToggle, onUpdate, onDelete }: DailyViewProps) {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showForm, setShowForm] = useState(true);

  const dayTasks = getTasksByDate(selectedDate);
  const isToday = selectedDate === getToday();
  const completedCount = dayTasks.filter(t => t.completed).length;
  const progress = dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;
  const greeting = useMemo(() => getGreeting(), []);

  const handleAddTask = (data: TaskFormData) => {
    onAddTask({ ...data, date: selectedDate });
  };

  const goToToday = () => setSelectedDate(getToday());

  const goToPrevDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Greeting Banner - only show for today */}
      {isToday && (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 rounded-2xl shadow-lg text-white animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{greeting.emoji}</span>
            <div>
              <p className="text-lg font-bold text-white">{greeting.text}!</p>
              <p className="text-sm text-white">
                {dayTasks.length === 0 ? 'Ready to be productive?' :
                 progress === 100 ? 'All tasks completed! Amazing!' :
                 `You have ${dayTasks.length - completedCount} task${dayTasks.length - completedCount !== 1 ? 's' : ''} remaining`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Date Navigation Card */}
      <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevDay}
            className="p-3 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 active:scale-90"
            aria-label="Previous day"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="text-center min-w-[140px]">
              <h2 className="text-2xl font-bold text-gray-800">
                {formatDisplayDate(selectedDate)}
              </h2>
              <p className="text-sm text-gray-600 mt-1 font-medium">
                {isToday ? '🌟 ' : ''}{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors"
              />

              {!isToday && (
                <button
                  onClick={goToToday}
                  className="btn-ripple px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  ⚡ Today
                </button>
              )}
            </div>
          </div>

          <button
            onClick={goToNextDay}
            className="p-3 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 active:scale-90"
            aria-label="Next day"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add Task Toggle & Form */}
      <div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="group flex items-center gap-3 text-sm font-semibold text-gray-600 hover:text-indigo-600 mb-4 transition-all duration-300"
        >
          <span className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-lg ${
            showForm
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rotate-45 scale-110'
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white group-hover:scale-110 group-hover:shadow-indigo-200'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </span>
          <span className="transition-all duration-300">
            {showForm ? '✕ Close form' : '✨ Add new task'}
          </span>
        </button>

        <div className={`transition-all duration-300 ${showForm ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none h-0 overflow-hidden'}`}>
          {showForm && <TaskForm onSubmit={handleAddTask} initialData={{ date: selectedDate }} />}
        </div>
      </div>

      {/* Task List */}
      <TaskList
        tasks={dayTasks}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />

      {/* Progress Stats */}
      {dayTasks.length > 0 && (
        <div className={`bg-white p-6 rounded-3xl shadow-lg border-2 transition-all duration-500 ${
          progress === 100 ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                progress === 100 ? 'bg-gradient-to-br from-emerald-400 to-teal-400 shadow-lg shadow-emerald-200 animate-bounce' : 'bg-gradient-to-br from-indigo-100 to-purple-100'
              }`}>
                {progress === 100 ? (
                  <span className="text-2xl">🏆</span>
                ) : (
                  <span className="text-2xl">📊</span>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Daily Progress</p>
                <p className="font-bold text-gray-900 text-lg">
                  <span className="text-indigo-600">{completedCount}</span> of <span className="text-gray-600">{dayTasks.length}</span> tasks
                </p>
              </div>
            </div>
            <div className={`text-4xl font-bold transition-all duration-500 ${
              progress === 100 ? 'text-emerald-500 scale-110 animate-pulse' : 'text-indigo-600'
            }`}>
              {progress}%
            </div>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                progress === 100
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 animate-gradient'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient'
              }`}
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full"></div>
            </div>
          </div>
          {progress === 100 && (
            <div className="text-center mt-4 animate-celebrate">
              <p className="text-emerald-600 font-bold text-lg">
                🎉 All tasks completed! 🎉
              </p>
              <p className="text-gray-500 text-sm mt-1">You're on fire! Keep up the great work!</p>
            </div>
          )}
          {progress >= 50 && progress < 100 && (
            <p className="text-center text-indigo-600 font-medium mt-3 text-sm">
              💪 Halfway there! Keep going!
            </p>
          )}
          {progress > 0 && progress < 50 && (
            <p className="text-center text-gray-500 font-medium mt-3 text-sm">
              🚀 Great start! You've got this!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
