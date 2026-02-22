import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Trash2, X } from 'lucide-react';

interface BulkActionsBarProps {
  selected: Set<string>;
  total: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCompleteSelected: () => void;
  onDeleteSelected: () => void;
}

export function BulkActionsBar({ selected, total, onSelectAll, onDeselectAll, onCompleteSelected, onDeleteSelected }: BulkActionsBarProps) {
  const count = selected.size;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.18 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-2xl border border-gray-700 dark:border-gray-200"
        >
          <span className="text-sm font-semibold mr-1">{count} selected</span>
          <div className="w-px h-4 bg-gray-600 dark:bg-gray-300" />
          {count < total && (
            <button onClick={onSelectAll} className="text-xs px-2 py-1 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors">
              All
            </button>
          )}
          <button
            onClick={onCompleteSelected}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all hover:scale-105 active:scale-95"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Complete
          </button>
          <button
            onClick={onDeleteSelected}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium transition-all hover:scale-105 active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <button onClick={onDeselectAll} className="p-1 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors ml-1">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
