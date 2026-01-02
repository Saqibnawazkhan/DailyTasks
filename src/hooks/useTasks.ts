import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskFormData } from '../types/task';
import { loadTasks, saveTasks } from '../utils/storage';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const storedTasks = loadTasks();
      setTasks(storedTasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks.');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    if (isLoaded) {
      saveTasks(tasks);
    }
  }, [tasks, isLoaded]);

  const addTask = useCallback(async (formData: TaskFormData): Promise<Task> => {
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

    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<TaskFormData>): Promise<void> => {
    const updatedAt = new Date().toISOString();

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
  }, []);

  const toggleTask = useCallback(async (id: string): Promise<void> => {
    const now = new Date().toISOString();

    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;

      const newCompleted = !task.completed;
      return {
        ...task,
        completed: newCompleted,
        completedAt: newCompleted ? now : null,
        updatedAt: now
      };
    }));
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

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
