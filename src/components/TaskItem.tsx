import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskFormData, Subtask } from '../types/task';
import { TaskForm } from './TaskForm';
import { Check, MoreVertical, Pencil, Trash2, Flag, Plus, ListChecks, CalendarClock } from 'lucide-react';

function getDateStatus(date: string): 'overdue' | 'today' | 'upcoming' | null {
  const today = new Date().toISOString().split('T')[0];
  if (date < today) return 'overdue';
  if (date === today) return 'today';
  if (date > today) return 'upcoming';
  return null;
}

const dateStatusConfig = {
  overdue:  { label: 'Overdue',  cls: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800' },
  today:    { label: 'Today',    cls: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' },
  upcoming: { label: 'Upcoming', cls: 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700' },
};

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskFormData>) => void;
  onDelete: (id: string) => void;
}

const priorityConfig = {
  low: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500', label: 'Low' },
  medium: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', label: 'Medium' },
  high: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500', label: 'High' }
};

export function TaskItem({ task, onToggle, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  const subtasks: Subtask[] = task.subtasks || [];
  const doneSubtasks = subtasks.filter(s => s.completed).length;

  const toggleSubtask = (subtaskId: string) => {
    const updated = subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
    onUpdate(task.id, { subtasks: updated } as Partial<TaskFormData> & { subtasks: Subtask[] });
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const updated = [...subtasks, { id: uuidv4(), title: newSubtask.trim(), completed: false }];
    onUpdate(task.id, { subtasks: updated } as Partial<TaskFormData> & { subtasks: Subtask[] });
    setNewSubtask('');
  };

  const handleEdit = (data: TaskFormData) => {
    onUpdate(task.id, data);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    setShowDeleteConfirm(false);
  };

  if (isEditing) {
    return (
      <div className="mb-3">
        <TaskForm
          initialData={{
            title: task.title,
            notes: task.notes || '',
            priority: task.priority,
            tags: task.tags,
            date: task.date
          }}
          onSubmit={handleEdit}
          submitLabel="Save Changes"
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.18 }}
      className={`group relative flex items-start gap-3 p-4 rounded-2xl border transition-all duration-200 ${
        task.completed
          ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 opacity-60'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
      }`}
    >
      {/* Priority stripe */}
      {task.priority && !task.completed && (
        <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${priorityConfig[task.priority].dot}`} />
      )}

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
          task.completed
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
        }`}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        <AnimatePresence>
          {task.completed && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
              <Check className="w-3 h-3" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onToggle(task.id)}>
        <p className={`text-sm font-medium leading-snug transition-all duration-200 ${
          task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-100'
        }`}>
          {task.title}
        </p>

        {task.notes && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-2">
            {task.notes}
          </p>
        )}

        {(task.priority || (task.tags && task.tags.length > 0) || (!task.completed && task.date)) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {task.priority && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].text} ${priorityConfig[task.priority].border}`}>
                <Flag className="w-2.5 h-2.5" />
                {priorityConfig[task.priority].label}
              </span>
            )}
            {!task.completed && task.date && (() => {
              const status = getDateStatus(task.date);
              if (!status) return null;
              const cfg = dateStatusConfig[status];
              return (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
                  <CalendarClock className="w-2.5 h-2.5" />
                  {cfg.label}
                </span>
              );
            })()}
            {task.tags?.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Subtask toggle */}
        {subtasks.length > 0 && (
          <button
            onClick={e => { e.stopPropagation(); setShowSubtasks(v => !v); }}
            className="mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-500 transition-colors"
          >
            <ListChecks className="w-3.5 h-3.5" />
            {doneSubtasks}/{subtasks.length} subtasks
          </button>
        )}
      </div>

      {/* Subtask expander button (no subtasks yet) */}
      {subtasks.length === 0 && !task.completed && (
        <button
          onClick={e => { e.stopPropagation(); setShowSubtasks(v => !v); }}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 dark:text-gray-600 hover:text-indigo-400 rounded transition-all"
          title="Add subtasks"
        >
          <ListChecks className="w-4 h-4" />
        </button>
      )}

      {/* Menu Button */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 text-gray-500 dark:text-gray-400"
          aria-label="Task options"
          title="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-10 z-20 w-40 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 overflow-hidden animate-scale-up">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-all duration-200"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 shadow-2xl animate-bounce-once">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-red-100 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Task?</h3>
            <p className="text-gray-500 text-center mb-6 text-sm">
              This will permanently delete <span className="font-semibold text-gray-700">"{task.title}"</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-ripple flex-1 px-4 py-3 text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-ripple flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-red-600 transition-all duration-300 shadow-lg shadow-rose-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtask Panel */}
      <AnimatePresence>
        {showSubtasks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden col-span-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="mt-2 ml-8 space-y-1.5 border-l-2 border-indigo-100 dark:border-indigo-900 pl-3">
              {subtasks.map(sub => (
                <label key={sub.id} className="flex items-center gap-2 cursor-pointer group/sub">
                  <button
                    onClick={() => toggleSubtask(sub.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      sub.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {sub.completed && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  </button>
                  <span className={`text-xs ${sub.completed ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-300'}`}>
                    {sub.title}
                  </span>
                </label>
              ))}
              <div className="flex items-center gap-1 mt-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSubtask()}
                  placeholder="Add subtask…"
                  className="flex-1 text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <button onClick={addSubtask} disabled={!newSubtask.trim()}
                  className="p-1 bg-indigo-500 text-white rounded-lg disabled:opacity-40 hover:bg-indigo-600 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
