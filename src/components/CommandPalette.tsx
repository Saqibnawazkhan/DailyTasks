import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types/task';
import { Search, CheckCircle, Calendar, BarChart3, Kanban, Check, X } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  onNavigate: (view: string) => void;
  onToggleTask: (id: string) => void;
}

export function CommandPalette({ open, onClose, tasks, onNavigate, onToggleTask }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const navCommands: Command[] = [
    { id: 'nav-today', label: 'Go to Tasks', description: 'Daily task view', icon: <CheckCircle className="w-4 h-4 text-indigo-500" />, action: () => { onNavigate('today'); onClose(); } },
    { id: 'nav-board', label: 'Go to Board', description: 'Kanban board view', icon: <Kanban className="w-4 h-4 text-purple-500" />, action: () => { onNavigate('kanban'); onClose(); } },
    { id: 'nav-calendar', label: 'Go to Calendar', description: 'Calendar view', icon: <Calendar className="w-4 h-4 text-blue-500" />, action: () => { onNavigate('calendar'); onClose(); } },
    { id: 'nav-stats', label: 'Go to Stats', description: 'Monthly report', icon: <BarChart3 className="w-4 h-4 text-emerald-500" />, action: () => { onNavigate('report'); onClose(); } },
  ];

  const taskCommands: Command[] = useMemo(() =>
    tasks
      .filter(t => !t.completed)
      .slice(0, 20)
      .map(t => ({
        id: `task-${t.id}`,
        label: t.title,
        description: t.priority ? `${t.priority} priority` : undefined,
        icon: <Check className="w-4 h-4 text-gray-400" />,
        action: () => { onToggleTask(t.id); onClose(); },
      })),
    [tasks, onToggleTask, onClose]
  );

  const allCommands = [...navCommands, ...taskCommands];

  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(c => c.label.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
  }, [query, allCommands]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => { setActiveIndex(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[activeIndex]) { filtered[activeIndex].action(); }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden pointer-events-auto"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search commands or tasks…"
                  className="flex-1 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                />
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">No results found</p>
                ) : (
                  filtered.map((cmd, idx) => (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        idx === activeIndex ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <span className="shrink-0">{cmd.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{cmd.label}</p>
                        {cmd.description && (
                          <p className="text-xs text-gray-400 truncate">{cmd.description}</p>
                        )}
                      </div>
                      {idx === activeIndex && (
                        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono shrink-0">↵</kbd>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 text-[11px] text-gray-400">
                <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="font-mono">↵</kbd> select</span>
                <span><kbd className="font-mono">Esc</kbd> close</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
