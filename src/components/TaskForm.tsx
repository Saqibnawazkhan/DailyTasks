import { useState, FormEvent } from 'react';
import { Priority, TaskFormData } from '../types/task';
import { getToday } from '../utils/date';

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  initialData?: Partial<TaskFormData>;
  submitLabel?: string;
  onCancel?: () => void;
}

const TITLE_MAX_LENGTH = 120;
const NOTES_MAX_LENGTH = 500;

export function TaskForm({ onSubmit, initialData, submitLabel = 'Add Task', onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [priority, setPriority] = useState<Priority | ''>(initialData?.priority || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [date, setDate] = useState(initialData?.date || getToday());
  const [errors, setErrors] = useState<{ title?: string; notes?: string }>({});

  const validate = (): boolean => {
    const newErrors: { title?: string; notes?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > TITLE_MAX_LENGTH) {
      newErrors.title = `Title must be ${TITLE_MAX_LENGTH} characters or less`;
    }

    if (notes.length > NOTES_MAX_LENGTH) {
      newErrors.notes = `Notes must be ${NOTES_MAX_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const tagList = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSubmit({
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority: priority || null,
      tags: tagList,
      date
    });

    // Reset form if not editing
    if (!initialData) {
      setTitle('');
      setNotes('');
      setPriority('');
      setTags('');
      setDate(getToday());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-2 border-transparent bg-gradient-to-r from-white via-white to-white relative before:absolute before:inset-0 before:rounded-3xl before:p-[2px] before:bg-gradient-to-r before:from-indigo-500 before:via-purple-500 before:to-pink-500 before:-z-10 before:animate-gradient">
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
          What needs to be done?
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="✨ Enter your task..."
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-300 ${
            errors.title
              ? 'border-red-400 bg-red-50 animate-shake'
              : 'border-gray-200 focus:border-indigo-400 focus:shadow-lg focus:shadow-indigo-100 bg-gray-50/50'
          }`}
          maxLength={TITLE_MAX_LENGTH}
        />
        <div className="flex justify-between mt-1.5">
          {errors.title && <span className="text-red-500 text-xs font-medium">{errors.title}</span>}
          <span className="text-gray-400 text-xs ml-auto">{title.length}/{TITLE_MAX_LENGTH}</span>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="📝 Add some details..."
          rows={2}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-300 resize-none ${
            errors.notes
              ? 'border-red-400 bg-red-50 animate-shake'
              : 'border-gray-200 focus:border-indigo-400 focus:shadow-lg focus:shadow-indigo-100 bg-gray-50/50'
          }`}
          maxLength={NOTES_MAX_LENGTH}
        />
        <div className="flex justify-between mt-1.5">
          {errors.notes && <span className="text-red-500 text-xs font-medium">{errors.notes}</span>}
          <span className="text-gray-400 text-xs ml-auto">{notes.length}/{NOTES_MAX_LENGTH}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="priority" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority | '')}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-gray-50/50 text-sm transition-colors"
          >
            <option value="">⚪ None</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-gray-50/50 text-sm transition-colors"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="work, personal"
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-gray-50/50 text-sm transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!title.trim()}
          className="btn-ripple flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:scale-100"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {submitLabel}
          </span>
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-ripple px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
