export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  createdAt: string; // ISO timestamp
  notes?: string | null;
  priority?: Priority | null;
  tags?: string[];
  completedAt?: string | null;
  updatedAt?: string | null;
}

export interface TaskFormData {
  title: string;
  notes?: string;
  priority?: Priority | null;
  tags?: string[];
  date: string;
}

export interface MonthlyStats {
  total: number;
  completed: number;
  incomplete: number;
  completionPercentage: number;
}

export interface DailyBreakdown {
  date: string;
  total: number;
  completed: number;
  incomplete: number;
  completionPercentage: number;
}

export interface MonthlyReport {
  month: string; // YYYY-MM format
  stats: MonthlyStats;
  dailyBreakdown: DailyBreakdown[];
  incompleteTasks: Task[];
}
