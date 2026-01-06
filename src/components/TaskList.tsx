import { Task, TaskFormData } from '../types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskFormData>) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export function TaskList({ tasks, onToggle, onUpdate, onDelete, emptyMessage = 'No tasks yet' }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-all duration-500 hover:shadow-lg hover:shadow-indigo-100/50 group">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce group-hover:animate-wobble">
          <span className="text-5xl">📝</span>
        </div>
        <p className="text-gray-700 font-bold text-xl mb-2">{emptyMessage}</p>
        <p className="text-gray-500 mb-4">Your productivity journey starts here!</p>
        <div className="flex justify-center gap-2 text-sm text-gray-400">
          <span className="px-3 py-1 bg-gray-100 rounded-full">✨ Stay organized</span>
          <span className="px-3 py-1 bg-gray-100 rounded-full">🎯 Track progress</span>
          <span className="px-3 py-1 bg-gray-100 rounded-full">🚀 Get things done</span>
        </div>
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
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            Pending
            <span className="text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2.5 py-1 rounded-full shadow-sm">
              {pendingTasks.length}
            </span>
          </h3>
          <div className="space-y-3">
            {pendingTasks.map((task, index) => (
              <div
                key={task.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-fade-in"
              >
                <TaskItem
                  task={task}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Completed ✨
            <span className="text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2.5 py-1 rounded-full shadow-sm">
              {completedTasks.length}
            </span>
          </h3>
          <div className="space-y-3">
            {completedTasks.map((task, index) => (
              <div
                key={task.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-fade-in"
              >
                <TaskItem
                  task={task}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
