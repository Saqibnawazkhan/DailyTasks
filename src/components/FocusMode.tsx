import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types/task';
import { X, Check, Zap } from 'lucide-react';

interface FocusModeProps {
  tasks: Task[];
  onClose: () => void;
  onToggle: (id: string) => void;
}

export function FocusMode({ tasks, onClose, onToggle }: FocusModeProps) {
  const pending = tasks.filter(t => !t.completed);
  const current = pending[0] ?? null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center px-6"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-16 text-indigo-400">
        <Zap className="w-5 h-5" />
        <span className="text-sm font-semibold uppercase tracking-widest">Focus Mode</span>
      </div>

      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.25 }}
            className="text-center max-w-2xl"
          >
            <p className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              {current.title}
            </p>
            {current.notes && (
              <p className="text-lg text-gray-400 mb-10 leading-relaxed">{current.notes}</p>
            )}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => onToggle(current.id)}
                className="flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-900"
              >
                <Check className="w-6 h-6" />
                Mark Done
              </button>
            </div>
            <p className="mt-8 text-gray-600 text-sm">{pending.length} task{pending.length !== 1 ? 's' : ''} remaining</p>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-6">🎉</div>
            <p className="text-3xl font-bold text-white mb-3">All Done!</p>
            <p className="text-gray-400 mb-8">You crushed every task. Amazing work!</p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-semibold transition-all hover:scale-105"
            >
              Back to Tasks
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      {tasks.length > 0 && (
        <div className="absolute bottom-8 flex gap-2">
          {tasks.slice(0, 12).map(t => (
            <div
              key={t.id}
              className={`w-2 h-2 rounded-full transition-all ${t.completed ? 'bg-emerald-500' : 'bg-gray-700'}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
