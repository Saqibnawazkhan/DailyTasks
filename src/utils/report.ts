import { Task, MonthlyStats, DailyBreakdown, MonthlyReport } from '../types/task';
import { getDaysInMonth } from './date';
import { getTasksByMonth } from './storage';

export function calculateStats(tasks: Task[]): MonthlyStats {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const incomplete = total - completed;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, incomplete, completionPercentage };
}

export function calculateDailyBreakdown(tasks: Task[], yearMonth: string): DailyBreakdown[] {
  const days = getDaysInMonth(yearMonth);
  const breakdown: DailyBreakdown[] = [];

  for (const date of days) {
    const dayTasks = tasks.filter(t => t.date === date);
    if (dayTasks.length === 0) continue;

    const stats = calculateStats(dayTasks);
    breakdown.push({
      date,
      ...stats
    });
  }

  return breakdown;
}

export function generateMonthlyReport(tasks: Task[], yearMonth: string): MonthlyReport {
  const monthTasks = getTasksByMonth(tasks, yearMonth);
  const stats = calculateStats(monthTasks);
  const dailyBreakdown = calculateDailyBreakdown(monthTasks, yearMonth);
  const incompleteTasks = monthTasks.filter(t => !t.completed);

  return {
    month: yearMonth,
    stats,
    dailyBreakdown,
    incompleteTasks
  };
}

export function getCompletionGrade(percentage: number): { grade: string; color: string } {
  if (percentage >= 90) return { grade: 'Outstanding', color: 'text-emerald-600' };
  if (percentage >= 70) return { grade: 'Great', color: 'text-indigo-600' };
  if (percentage >= 50) return { grade: 'Good', color: 'text-amber-600' };
  return { grade: 'Keep Going', color: 'text-rose-600' };
}
