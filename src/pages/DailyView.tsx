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
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Previous day"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">
                {isToday ? 'Today' : formatDisplayDate(selectedDate)}
              </h2>
              {isToday && (
                <p className="text-sm text-gray-500">{formatDisplayDate(selectedDate)}</p>
              )}
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors"
            />

            {!isToday && (
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-xl font-medium hover:bg-indigo-200 transition-colors"
              >
                Today
              </button>
            )}
          </div>

          <button
            onClick={goToNextDay}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Next day"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add Task Toggle & Form */}
      <div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 mb-4 transition-colors"
        >
          <span className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
            showForm ? 'bg-indigo-100 text-indigo-600 rotate-45' : 'bg-gray-100 text-gray-500'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </span>
          {showForm ? 'Hide form' : 'Add new task'}
        </button>

        {showForm && <TaskForm onSubmit={handleAddTask} initialData={{ date: selectedDate }} />}
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
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                progress === 100 ? 'bg-emerald-100' : 'bg-indigo-100'
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
            <div className={`text-2xl font-bold ${
              progress === 100 ? 'text-emerald-600' : 'text-indigo-600'
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
        </div>
      )}
    </div>
  );
}
