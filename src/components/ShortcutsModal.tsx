import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { useEffect } from 'react';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { group: 'Navigation', items: [
    { keys: ['1'], desc: 'Go to Tasks' },
    { keys: ['2'], desc: 'Go to Board' },
    { keys: ['3'], desc: 'Go to Calendar' },
    { keys: ['4'], desc: 'Go to Stats' },
    { keys: ['N'], desc: 'New task (focus input)' },
  ]},
  { group: 'Tools', items: [
    { keys: ['⌘', 'P'], desc: 'Open command palette' },
    { keys: ['⌘', 'K'], desc: 'Focus search bar' },
    { keys: ['?'], desc: 'Show this help' },
    { keys: ['Esc'], desc: 'Close any overlay' },
  ]},
];

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

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
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <Keyboard className="w-5 h-5 text-indigo-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white flex-1">Keyboard Shortcuts</h2>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                {SHORTCUTS.map(group => (
                  <div key={group.group}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{group.group}</p>
                    <div className="space-y-2">
                      {group.items.map(item => (
                        <div key={item.desc} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.desc}</span>
                          <div className="flex items-center gap-1">
                            {item.keys.map((k, i) => (
                              <kbd key={i} className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                {k}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 text-center">Press <kbd className="font-mono px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">?</kbd> anytime to open this</p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
