import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Task, TaskFormData } from '../types/task';
import { TaskItem } from './TaskItem';
import { BulkActionsBar } from './BulkActionsBar';
import { CheckCheck, Circle, ChevronDown, Inbox, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskFormData>) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
  gridView?: boolean;
}

const quotes = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Small progress is still progress.", author: "Unknown" },
  { quote: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { quote: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
];

function SortableTaskRow({
  task, selected, onSelect, onToggle, onUpdate, onDelete
}: {
  task: Task;
  selected: boolean;
  onSelect: () => void;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskFormData>) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group/sel flex items-center gap-1 ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover/sel:opacity-100 p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-opacity shrink-0 touch-none"
        tabIndex={-1}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Selection checkbox */}
      <input
        type="checkbox"
        checked={selected}
        onChange={onSelect}
        className="w-3.5 h-3.5 opacity-0 group-hover/sel:opacity-100 transition-opacity cursor-pointer accent-indigo-600 shrink-0"
      />

      <div className={`flex-1 transition-all ${selected ? '' : ''}`}>
        <TaskItem task={task} onToggle={onToggle} onUpdate={onUpdate} onDelete={onDelete} />
      </div>
    </div>
  );
}

export function TaskList({ tasks, onToggle, onUpdate, onDelete, emptyMessage = 'No tasks yet', gridView = false }: TaskListProps) {
  const [showCompleted, setShowCompleted] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [orderedPending, setOrderedPending] = useState<Task[]>(() => tasks.filter(t => !t.completed));
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  // Keep orderedPending in sync when tasks change from outside
  const syncedPending = orderedPending
    .filter(op => pending.some(p => p.id === op.id))
    .map(op => pending.find(p => p.id === op.id)!)
    .concat(pending.filter(p => !orderedPending.some(op => op.id === p.id)));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrderedPending(() => {
        const ids = syncedPending.map(t => t.id);
        const oldIdx = ids.indexOf(String(active.id));
        const newIdx = ids.indexOf(String(over.id));
        return arrayMove(syncedPending, oldIdx, newIdx);
      });
    }
  }, [syncedPending]);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);

  const handleCompleteSelected = useCallback(() => {
    selected.forEach(id => { const task = tasks.find(t => t.id === id); if (task && !task.completed) onToggle(id); });
    setSelected(new Set());
  }, [selected, tasks, onToggle]);

  const handleDeleteSelected = useCallback(() => {
    selected.forEach(id => onDelete(id));
    setSelected(new Set());
  }, [selected, onDelete]);

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20"
      >
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
          <Inbox className="w-7 h-7 text-indigo-400 dark:text-indigo-500" />
        </div>
        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{emptyMessage}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">Add your first task above to get started</p>
        <blockquote className="max-w-xs text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{quote.quote}"</p>
          <footer className="text-xs text-gray-400 dark:text-gray-500 mt-1">— {quote.author}</footer>
        </blockquote>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Pending section with DnD */}
      {syncedPending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Circle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">In progress</span>
            <span className="ml-1 text-xs font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full">{syncedPending.length}</span>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={syncedPending.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence initial={false}>
                <div className={gridView ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
                  {syncedPending.map(task => (
                    <SortableTaskRow
                      key={task.id}
                      task={task}
                      selected={selected.has(task.id)}
                      onSelect={() => toggleSelect(task.id)}
                      onToggle={onToggle}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Completed section */}
      {completed.length > 0 && (
        <div>
          <button onClick={() => setShowCompleted(v => !v)} className="flex items-center gap-2 mb-3 group">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completed</span>
            <span className="ml-1 text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full">{completed.length}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 ml-auto transition-transform duration-200 ${showCompleted ? '' : '-rotate-90'}`} />
          </button>
          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {completed.map(task => (
                    <TaskItem key={task.id} task={task} onToggle={onToggle} onUpdate={onUpdate} onDelete={onDelete} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <BulkActionsBar
        selected={selected}
        total={tasks.length}
        onSelectAll={() => setSelected(new Set(tasks.map(t => t.id)))}
        onDeselectAll={() => setSelected(new Set())}
        onCompleteSelected={handleCompleteSelected}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
}
