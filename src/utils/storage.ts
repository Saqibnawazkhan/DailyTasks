import { Task } from '../types/task';

const STORAGE_KEY = 'taskflow_data_v2';

export function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Task[];
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}

export function getTasksByDate(tasks: Task[], date: string): Task[] {
  return tasks.filter(task => task.date === date);
}

export function getTasksByMonth(tasks: Task[], yearMonth: string): Task[] {
  return tasks.filter(task => task.date.startsWith(yearMonth));
}
