import { useEffect, useCallback, useState } from 'react';
import { Task } from '../types/task';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function useNotifications(tasks: Task[]) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const notifyOverdue = useCallback(() => {
    if (permission !== 'granted') return;
    const today = getToday();
    const overdue = tasks.filter(t => !t.completed && t.date < today);
    if (overdue.length === 0) return;
    new Notification('TaskFlow — Overdue Tasks', {
      body: `You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}. Time to catch up!`,
      icon: '/favicon.svg',
      tag: 'taskflow-overdue',
    });
  }, [tasks, permission]);

  const notifyDueToday = useCallback(() => {
    if (permission !== 'granted') return;
    const today = getToday();
    const dueToday = tasks.filter(t => !t.completed && t.date === today);
    if (dueToday.length === 0) return;
    new Notification('TaskFlow — Tasks Due Today', {
      body: `${dueToday.length} task${dueToday.length > 1 ? 's' : ''} due today. Let's go!`,
      icon: '/favicon.svg',
      tag: 'taskflow-today',
    });
  }, [tasks, permission]);

  // Auto-notify overdue tasks on mount (once)
  useEffect(() => {
    if (permission !== 'granted') return;
    const timer = setTimeout(notifyOverdue, 3000);
    return () => clearTimeout(timer);
  }, [permission, notifyOverdue]);

  return { permission, requestPermission, notifyOverdue, notifyDueToday };
}
