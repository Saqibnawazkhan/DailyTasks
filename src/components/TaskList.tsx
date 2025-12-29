import { Task, TaskFormData } from '../types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskFormData>) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export function TaskList({ tasks, onToggle, onUpdate, onDelete, emptyMessage = 'No tasks yet. Add your first task.' }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-6">
      {pendingTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Pending ({pendingTasks.length})
          </h3>
          <div className="space-y-2">
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
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-2">
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
