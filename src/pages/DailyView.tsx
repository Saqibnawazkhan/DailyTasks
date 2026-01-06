import { useState } from 'react';
import { Task, TaskFormData } from '../types/task';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { getToday, formatDisplayDate } from '../utils/date';

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
      {/* Date Navigation Card */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/50">
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
            <div className="text-center min-w-[120px]">
              <h2 className="text-xl font-bold text-gray-900">
                {formatDisplayDate(selectedDate)}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
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
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                progress === 100 ? 'bg-emerald-100 animate-pulse' : 'bg-indigo-100'
              }`}>
                {progress === 100 ? (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Daily Progress</p>
                <p className="font-bold text-gray-900">
                  {completedCount} of {dayTasks.length} completed
                </p>
              </div>
            </div>
            <div className={`text-2xl font-bold transition-all duration-300 ${
              progress === 100 ? 'text-emerald-600 scale-110' : 'text-indigo-600'
            }`}>
              {progress}%
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress === 100
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${progress}%` }}
            />
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
