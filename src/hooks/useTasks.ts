import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@supabase/supabase-js';
import { Task, TaskFormData } from '../types/task';
import { loadTasks, saveTasks } from '../utils/storage';
import { supabase, dbTaskToTask, taskToDbTask, DbTask } from '../lib/supabase';

export function useTasks(user: User | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tasks on mount or when user changes
  useEffect(() => {
    async function loadData() {
      setIsLoaded(false);
      setTasks([]);

      try {
        if (supabase && user) {
          // Load from Supabase for logged-in user
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const loadedTasks = (data as DbTask[]).map(dbTaskToTask);
          setTasks(loadedTasks);
        } else if (!supabase) {
          // Fallback to localStorage if Supabase not configured
          const storedTasks = loadTasks();
          setTasks(storedTasks);
        }
        // If supabase exists but no user, tasks stay empty (user needs to log in)
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setError('Failed to load tasks.');
      } finally {
        setIsLoaded(true);
      }
    }

    loadData();
  }, [user]);

  // Save to localStorage as backup whenever tasks change (only if no supabase)
  useEffect(() => {
    if (isLoaded && !supabase) {
      saveTasks(tasks);
    }
  }, [tasks, isLoaded]);

  const addTask = useCallback(async (formData: TaskFormData): Promise<Task> => {
    if (!user && supabase) {
      throw new Error('Must be logged in to add tasks');
    }

    const now = new Date().toISOString();
    const newTask: Task = {
      id: uuidv4(),
      title: formData.title.trim(),
      date: formData.date,
      completed: false,
      createdAt: now,
      notes: formData.notes?.trim() || null,
      priority: formData.priority || null,
      tags: formData.tags || [],
      completedAt: null,
      updatedAt: null
    };

    // Optimistically update UI
    setTasks(prev => [...prev, newTask]);

    if (supabase && user) {
      try {
        const dbTask = {
          ...taskToDbTask(newTask),
          user_id: user.id
        };

        const { error } = await supabase
          .from('tasks')
          .insert(dbTask);

        if (error) throw error;
      } catch (err) {
        console.error('Failed to save task to Supabase:', err);
        setError('Failed to save to cloud.');
        // Rollback optimistic update
        setTasks(prev => prev.filter(t => t.id !== newTask.id));
        throw err;
      }
    }

    return newTask;
  }, [user]);

  const updateTask = useCallback(async (id: string, updates: Partial<TaskFormData>): Promise<void> => {
    const updatedAt = new Date().toISOString();

    // Store previous state for rollback
    const previousTasks = tasks;

    // Optimistically update UI
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;

      return {
        ...task,
        ...(updates.title !== undefined && { title: updates.title.trim() }),
        ...(updates.notes !== undefined && { notes: updates.notes?.trim() || null }),
        ...(updates.priority !== undefined && { priority: updates.priority }),
        ...(updates.tags !== undefined && { tags: updates.tags }),
        ...(updates.date !== undefined && { date: updates.date }),
        updatedAt
      };
    }));

    if (supabase && user) {
      try {
        const updateData: Record<string, unknown> = { updated_at: updatedAt };
        if (updates.title !== undefined) updateData.title = updates.title.trim();
        if (updates.notes !== undefined) updateData.notes = updates.notes?.trim() || null;
        if (updates.priority !== undefined) updateData.priority = updates.priority;
        if (updates.tags !== undefined) updateData.tags = updates.tags;
        if (updates.date !== undefined) updateData.date = updates.date;

        const { error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (err) {
        console.error('Failed to update task in Supabase:', err);
        setError('Failed to sync update to cloud.');
        setTasks(previousTasks);
      }
    }
  }, [user, tasks]);

  const toggleTask = useCallback(async (id: string): Promise<void> => {
    const now = new Date().toISOString();
    let newCompleted = false;

    // Store previous state for rollback
    const previousTasks = tasks;

    // Optimistically update UI
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;

      newCompleted = !task.completed;
      return {
        ...task,
        completed: newCompleted,
        completedAt: newCompleted ? now : null,
        updatedAt: now
      };
    }));

    if (supabase && user) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({
            completed: newCompleted,
            completed_at: newCompleted ? now : null,
            updated_at: now
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (err) {
        console.error('Failed to toggle task in Supabase:', err);
        setError('Failed to sync to cloud.');
        setTasks(previousTasks);
      }
    }
  }, [user, tasks]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    // Store previous state for rollback
    const previousTasks = tasks;

    // Optimistically update UI
    setTasks(prev => prev.filter(task => task.id !== id));

    if (supabase && user) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (err) {
        console.error('Failed to delete task from Supabase:', err);
        setError('Failed to delete from cloud.');
        setTasks(previousTasks);
      }
    }
  }, [user, tasks]);

  const getTasksByDate = useCallback((date: string): Task[] => {
    return tasks.filter(task => task.date === date);
  }, [tasks]);

  const getTasksByMonth = useCallback((yearMonth: string): Task[] => {
    return tasks.filter(task => task.date.startsWith(yearMonth));
  }, [tasks]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tasks,
    isLoaded,
    error,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    getTasksByDate,
    getTasksByMonth,
    clearError
  };
}
