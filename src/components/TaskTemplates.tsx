import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { TaskFormData } from '../types/task';
import { getToday } from '../utils/date';

interface Template {
  id: string;
  label: string;
  emoji: string;
  tasks: Omit<TaskFormData, 'date'>[];
}

const TEMPLATES: Template[] = [
  {
    id: 'morning',
    label: 'Morning Routine',
    emoji: '🌅',
    tasks: [
      { title: 'Drink a glass of water', priority: 'high', tags: ['health'] },
      { title: 'Morning workout (30 min)', priority: 'high', tags: ['health', 'fitness'] },
      { title: 'Healthy breakfast', priority: 'medium', tags: ['health'] },
      { title: 'Review today\'s goals', priority: 'medium', tags: ['planning'] },
    ],
  },
  {
    id: 'deep-work',
    label: 'Deep Work Session',
    emoji: '🧠',
    tasks: [
      { title: 'Clear desk & disable notifications', priority: 'high', tags: ['focus'] },
      { title: 'Identify top 3 priorities', priority: 'high', tags: ['planning'] },
      { title: '90-minute deep work block', priority: 'high', tags: ['focus', 'work'] },
      { title: 'Short break (10 min)', priority: 'low', tags: ['health'] },
    ],
  },
  {
    id: 'weekly-review',
    label: 'Weekly Review',
    emoji: '📋',
    tasks: [
      { title: 'Review last week\'s completed tasks', priority: 'medium', tags: ['review'] },
      { title: 'Update project statuses', priority: 'high', tags: ['work', 'planning'] },
      { title: 'Plan next week\'s priorities', priority: 'high', tags: ['planning'] },
      { title: 'Clear email inbox', priority: 'medium', tags: ['work'] },
      { title: 'Set weekly goals', priority: 'high', tags: ['planning'] },
    ],
  },
  {
    id: 'learning',
    label: 'Learning Day',
    emoji: '📚',
    tasks: [
      { title: 'Read for 30 minutes', priority: 'medium', tags: ['learning'] },
      { title: 'Watch one tutorial / lecture', priority: 'medium', tags: ['learning'] },
      { title: 'Practice / apply new skill', priority: 'high', tags: ['learning', 'practice'] },
      { title: 'Write notes & key takeaways', priority: 'low', tags: ['learning'] },
    ],
  },
];

interface TaskTemplatesProps {
  open: boolean;
  onClose: () => void;
  onAddTask: (data: TaskFormData) => void;
}

export function TaskTemplates({ open, onClose, onAddTask }: TaskTemplatesProps) {
  const applyTemplate = (template: Template) => {
    const today = getToday();
    template.tasks.forEach(t => onAddTask({ ...t, date: today }));
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white flex-1">Task Templates</h2>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {TEMPLATES.map(tmpl => (
                  <button
                    key={tmpl.id}
                    onClick={() => applyTemplate(tmpl)}
                    className="flex flex-col items-start gap-2 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all text-left group"
                  >
                    <span className="text-2xl">{tmpl.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                        {tmpl.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{tmpl.tasks.length} tasks</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 text-center">Templates add tasks to today's list</p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
