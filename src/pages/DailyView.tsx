import { useState, useMemo } from 'react';
import { Task, TaskFormData } from '../types/task';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { SearchBar } from '../components/SearchBar';
import { getToday, formatDisplayDate } from '../utils/date';
import { ChevronLeft, ChevronRight, Plus, ArrowUpDown } from 'lucide-react';

type SortOption = 'default' | 'priority' | 'title' | 'date';

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function sortTasks(tasks: Task[], sort: SortOption): Task[] {
  if (sort === 'default') return tasks;
  return [...tasks].sort((a, b) => {
    if (sort === 'priority') {
      return (PRIORITY_ORDER[a.priority || 'low'] ?? 3) - (PRIORITY_ORDER[b.priority || 'low'] ?? 3);
    }
    if (sort === 'title') return a.title.localeCompare(b.title);
    if (sort === 'date') return (a.date || '').localeCompare(b.date || '');
    return 0;
  });
}

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
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('default');

  const dayTasks = getTasksByDate(selectedDate);
  const filteredTasks = useMemo(() => {
    const filtered = search.trim()
      ? dayTasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.notes?.toLowerCase().includes(search.toLowerCase()) || t.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
      : dayTasks;
    return sortTasks(filtered, sort);
  }, [dayTasks, search, sort]);
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
    <div className="space-y-4">
      {/* Date Navigator */}
      <div className="flex items-center gap-2">
        <button onClick={goToPrevDay} aria-label="Previous day"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors active:scale-90">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{formatDisplayDate(selectedDate)}</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={goToNextDay} aria-label="Next day"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors active:scale-90">
          <ChevronRight className="w-5 h-5" />
        </button>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          className="text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        {!isToday && (
          <button onClick={goToToday}
            className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors active:scale-95">
            Today
          </button>
        )}
      </div>

      {/* Greeting + progress row */}
      {isToday && (
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white">
          <span className="text-2xl">{greeting.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{greeting.text}!</p>
            <p className="text-xs text-white/80">
              {dayTasks.length === 0 ? 'No tasks yet — add one below' :
               progress === 100 ? 'All done! Amazing work 🎉' :
               `${dayTasks.length - completedCount} remaining`}
            </p>
          </div>
          {dayTasks.length > 0 && (
            <div className="text-right shrink-0">
              <p className="text-xl font-bold">{progress}%</p>
              <p className="text-xs text-white/70">{completedCount}/{dayTasks.length}</p>
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      {dayTasks.length > 0 && (
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Add task button + form */}
      <div>
        <button onClick={() => setShowForm(v => !v)}
          className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all duration-200 ${
            showForm
              ? 'border-rose-300 dark:border-rose-800 text-rose-500 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/10'
              : 'border-indigo-200 dark:border-indigo-800 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'
          }`}>
          <Plus className={`w-4 h-4 transition-transform duration-200 ${showForm ? 'rotate-45' : ''}`} strokeWidth={2.5} />
          {showForm ? 'Close form' : 'Add new task'}
        </button>

        {showForm && (
          <div className="mt-3">
            <TaskForm onSubmit={handleAddTask} initialData={{ date: selectedDate }} />
          </div>
        )}
      </div>

      {/* Search + Sort */}
      {dayTasks.length > 0 && (
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Search tasks… (⌘K)" />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="h-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none cursor-pointer"
            >
              <option value="default">Default</option>
              <option value="priority">Priority</option>
              <option value="title">A → Z</option>
              <option value="date">Date</option>
            </select>
            <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      <TaskList
        tasks={filteredTasks}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
        emptyMessage={search ? 'No tasks match your search' : 'No tasks yet'}
      />
    </div>
  );
}
