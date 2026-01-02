import { Task, TaskFormData } from '../types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskFormData>) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export function TaskList({ tasks, onToggle, onUpdate, onDelete, emptyMessage = 'No tasks yet. Add your first task!' }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-6">
      {pendingTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Pending
            <span className="text-xs font-normal bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
              {pendingTasks.length}
            </span>
          </h3>
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Completed
            <span className="text-xs font-normal bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
              {completedTasks.length}
            </span>
          </h3>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
