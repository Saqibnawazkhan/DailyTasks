import { createClient } from '@supabase/supabase-js';
import { Task } from '../types/task';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using localStorage fallback.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types matching our Task interface
export interface DbTask {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  created_at: string;
  notes: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  tags: string[];
  completed_at: string | null;
  updated_at: string | null;
  user_id?: string;
}

// Convert database task to app task
export function dbTaskToTask(dbTask: DbTask): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    date: dbTask.date,
    completed: dbTask.completed,
    createdAt: dbTask.created_at,
    notes: dbTask.notes,
    priority: dbTask.priority,
    tags: dbTask.tags || [],
    completedAt: dbTask.completed_at,
    updatedAt: dbTask.updated_at,
  };
}

// Convert app task to database task
export function taskToDbTask(task: Task): Omit<DbTask, 'user_id'> {
  return {
    id: task.id,
    title: task.title,
    date: task.date,
    completed: task.completed,
    created_at: task.createdAt,
    notes: task.notes || null,
    priority: task.priority || null,
    tags: task.tags || [],
    completed_at: task.completedAt || null,
    updated_at: task.updatedAt || null,
  };
}
