import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Task, TaskFormData } from '../types/task';
import { loadTasks, saveTasks } from '../utils/storage';
import { useSettingsStore } from '../store/settingsStore';

function playTick() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(); osc.stop(ctx.currentTime + 0.12);
  } catch { /* ignore */ }
}

export function useTasks() {
  const { soundEnabled } = useSettingsStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const undoSnapshot = useRef<Task[] | null>(null);

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
    toast.success('Task added!', { description: newTask.title });
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

    setTasks(prev => {
      const updated = prev.map(task => {
        if (task.id !== id) return task;
        const newCompleted = !task.completed;
        if (newCompleted) {
          toast.success('Task completed! 🎉', { description: task.title });
          if (soundEnabled) playTick();
        }
        return { ...task, completed: newCompleted, completedAt: newCompleted ? now : null, updatedAt: now };
      });

      // Fire confetti if all tasks are now done
      const allDone = updated.length > 0 && updated.every(t => t.completed);
      if (allDone) {
        setTimeout(() => {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'] });
        }, 200);
        toast.success('All tasks done! 🎊', { description: 'Incredible work today!' });
      }

      return updated;
    });
  }, []);

  const undoLast = useCallback(() => {
    if (undoSnapshot.current) {
      setTasks(undoSnapshot.current);
      undoSnapshot.current = null;
      toast.success('Undone!');
    }
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task) {
        undoSnapshot.current = prev;
        toast.error('Task deleted', {
          description: task.title,
          action: { label: 'Undo', onClick: () => { setTasks(undoSnapshot.current ?? prev); undoSnapshot.current = null; } }
        });
      }
      return prev.filter(t => t.id !== id);
    });
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

  const exportTasks = useCallback(() => {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tasks exported!', { description: `${tasks.length} tasks downloaded as JSON` });
  }, [tasks]);

  const importTasks = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as Task[];
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        setTasks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const newTasks = imported.filter(t => !existingIds.has(t.id));
          toast.success('Tasks imported!', { description: `${newTasks.length} new tasks added` });
          return [...prev, ...newTasks];
        });
      } catch {
        toast.error('Import failed', { description: 'Invalid JSON file' });
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    tasks,
    isLoaded,
    error,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    undoLast,
    getTasksByDate,
    getTasksByMonth,
    clearError,
    exportTasks,
    importTasks
  };
}
