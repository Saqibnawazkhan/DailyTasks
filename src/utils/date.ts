export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatMonthYear(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getDaysInMonth(yearMonth: string): string[] {
  const [year, month] = yearMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: string[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    days.push(`${yearMonth}-${dayStr}`);
  }

  return days;
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatMonthDisplay(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}

export function getMonthsList(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const now = new Date();

  // Get last 12 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = formatMonthYear(date);
    const label = formatMonthDisplay(value);
    months.push({ value, label });
  }

  return months;
}
