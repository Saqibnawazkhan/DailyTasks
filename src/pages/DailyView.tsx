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
      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={goToPrevDay}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Previous day"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
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
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {!isToday && (
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              Go to Today
            </button>
          )}
        </div>

        <button
          onClick={goToNextDay}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Next day"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Task Form Toggle */}
      <div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showForm ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
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

      {/* Day Stats */}
      {dayTasks.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {dayTasks.filter(t => t.completed).length} of {dayTasks.length} tasks completed
            </span>
            <span className="font-medium text-blue-600">
              {Math.round((dayTasks.filter(t => t.completed).length / dayTasks.length) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(dayTasks.filter(t => t.completed).length / dayTasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
