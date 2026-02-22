import { useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskFormData } from '../types/task';
import { Check, Trash2, Flag, Circle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskFormData>) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_COLOR: Record<string, string> = {
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

interface Column {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  headerBg: string;
  filter: (t: Task) => boolean;
}

export const KanbanView = memo(function KanbanView({ tasks, onToggle, onDelete }: KanbanViewProps) {
  const columns: Column[] = useMemo(() => [
    {
      id: 'todo',
      label: 'To Do',
      icon: <Circle className="w-4 h-4" />,
      color: 'border-gray-300 dark:border-gray-700',
      headerBg: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      filter: (t) => !t.completed && t.priority !== 'high',
    },
    {
      id: 'urgent',
      label: 'Urgent',
      icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
      color: 'border-rose-200 dark:border-rose-900',
      headerBg: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
      filter: (t) => !t.completed && t.priority === 'high',
    },
    {
      id: 'done',
      label: 'Done',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      color: 'border-emerald-200 dark:border-emerald-900',
      headerBg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      filter: (t) => t.completed,
    },
  ], []);

  const columnTasks = useMemo(() =>
    columns.map(col => ({ ...col, tasks: tasks.filter(col.filter) })),
    [columns, tasks]
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Board View</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Visualize your tasks by status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columnTasks.map(col => (
          <div key={col.id} className={`rounded-2xl border-2 ${col.color} bg-gray-50/50 dark:bg-gray-900/50 flex flex-col min-h-64`}>
            {/* Column header */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-t-xl ${col.headerBg}`}>
              {col.icon}
              <span className="font-semibold text-sm">{col.label}</span>
              <span className="ml-auto text-xs font-bold bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-full">
                {col.tasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
              <AnimatePresence initial={false}>
                {col.tasks.map(task => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 group ${task.completed ? 'opacity-60' : 'hover:shadow-md transition-shadow'}`}
                  >
                    <div className="flex items-start gap-2">
                      {/* Checkbox */}
                      <button
                        onClick={() => onToggle(task.id)}
                        className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
                          task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                        }`}
                      >
                        {task.completed && <Check className="w-2 h-2" strokeWidth={3} />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-snug ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                          {task.title}
                        </p>
                        {task.notes && (
                          <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 line-clamp-2">
                            {task.notes}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          {task.priority && (
                            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_COLOR[task.priority]}`} />
                          )}
                          {task.priority && (
                            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                              <Flag className="w-2 h-2" />
                              {task.priority}
                            </span>
                          )}
                          {task.tags?.map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => onDelete(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-rose-500 rounded transition-all shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subtask progress */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks</span>
                        </div>
                        <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-400 rounded-full"
                            style={{ width: `${Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {col.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                    {col.icon}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
