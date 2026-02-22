import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Priority, TaskFormData } from '../types/task';
import { getToday } from '../utils/date';
import { Plus, X, Flag, Calendar, Tag, FileText, Palette } from 'lucide-react';

const TASK_COLORS = [
  { id: 'red',    hex: '#f43f5e' },
  { id: 'orange', hex: '#f97316' },
  { id: 'yellow', hex: '#eab308' },
  { id: 'green',  hex: '#22c55e' },
  { id: 'teal',   hex: '#14b8a6' },
  { id: 'blue',   hex: '#3b82f6' },
  { id: 'purple', hex: '#a855f7' },
  { id: 'pink',   hex: '#ec4899' },
];

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  initialData?: Partial<TaskFormData>;
  submitLabel?: string;
  onCancel?: () => void;
}

const TITLE_MAX = 120;
const NOTES_MAX = 500;

const PRIORITY_OPTIONS: { value: Priority | ''; label: string; color: string }[] = [
  { value: '',       label: 'None',   color: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' },
  { value: 'low',    label: 'Low',    color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' },
  { value: 'high',   label: 'High',   color: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400' },
];

export function TaskForm({ onSubmit, initialData, submitLabel = 'Add Task', onCancel }: TaskFormProps) {
  const [title, setTitle]       = useState(initialData?.title || '');
  const [notes, setNotes]       = useState(initialData?.notes || '');
  const [priority, setPriority] = useState<Priority | ''>(initialData?.priority || '');
  const [tags, setTags]         = useState(initialData?.tags?.join(', ') || '');
  const [date, setDate]         = useState(initialData?.date || getToday());
  const [color, setColor]       = useState(initialData?.color || '');
  const [errors, setErrors]     = useState<{ title?: string }>({});

  const validate = () => {
    if (!title.trim()) { setErrors({ title: 'Title is required' }); return false; }
    if (title.length > TITLE_MAX) { setErrors({ title: `Max ${TITLE_MAX} chars` }); return false; }
    setErrors({});
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    onSubmit({ title: title.trim(), notes: notes.trim() || undefined, priority: priority || null, tags: tagList, date, color: color || null });
    if (!initialData) { setTitle(''); setNotes(''); setPriority(''); setTags(''); setDate(getToday()); setColor(''); }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
    >
      {/* Title row */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
            maxLength={TITLE_MAX}
            className={`flex-1 text-sm font-medium bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 ${errors.title ? 'placeholder-rose-400' : ''}`}
          />
          <span className="text-[10px] text-gray-300 dark:text-gray-600 shrink-0">{title.length}/{TITLE_MAX}</span>
        </div>
        {errors.title && <p className="mt-1 ml-6 text-xs text-rose-500">{errors.title}</p>}
      </div>

      {/* Notes */}
      <div className="px-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-2">
          <FileText className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 mt-1 shrink-0" />
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes… (optional)"
            rows={2}
            maxLength={NOTES_MAX}
            className="flex-1 text-xs bg-transparent focus:outline-none text-gray-600 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-600 resize-none"
          />
        </div>
      </div>

      {/* Meta row: priority, date, tags */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-gray-700">
        {/* Priority pills */}
        <div className="flex items-center gap-1.5">
          <Flag className="w-3 h-3 text-gray-400" />
          <div className="flex gap-1">
            {PRIORITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition-all ${
                  priority === opt.value
                    ? opt.color + ' ring-2 ring-offset-1 ring-indigo-400'
                    : opt.color + ' opacity-60 hover:opacity-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-gray-400" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="text-xs bg-transparent text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Tag className="w-3 h-3 text-gray-400 shrink-0" />
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="tags, comma-separated"
            className="flex-1 text-xs bg-transparent text-gray-600 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none min-w-0"
          />
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-1.5">
          <Palette className="w-3 h-3 text-gray-400" />
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setColor('')}
              title="No color"
              className={`w-4 h-4 rounded-full border-2 bg-gray-200 dark:bg-gray-600 transition-all ${!color ? 'border-indigo-500 scale-125' : 'border-transparent'}`}
            />
            {TASK_COLORS.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                title={c.id}
                className={`w-4 h-4 rounded-full border-2 transition-all ${color === c.id ? 'border-indigo-500 scale-125' : 'border-transparent'}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex items-center gap-2">
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-2 text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>
    </motion.form>
  );
}
