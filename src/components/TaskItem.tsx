import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskFormData } from '../types/task';
import { TaskForm } from './TaskForm';
import { Check, MoreVertical, Pencil, Trash2, Flag } from 'lucide-react';

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

        {(task.priority || (task.tags && task.tags.length > 0)) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {task.priority && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].text} ${priorityConfig[task.priority].border}`}>
                <Flag className="w-2.5 h-2.5" />
                {priorityConfig[task.priority].label}
              </span>
            )}
            {task.tags?.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

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
    </motion.div>
  );
}
