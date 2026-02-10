import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function parseLocalDate(date: Date | string): Date {
  if (typeof date === 'string') {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return date;
}

export function formatDate(date: Date | string): string {
  const d = parseLocalDate(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateFull(date: Date | string): string {
  const d = parseLocalDate(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isToday(date: Date | string): boolean {
  const d = parseLocalDate(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function isTomorrow(date: Date | string): boolean {
  const d = parseLocalDate(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
}

export function isOverdue(date: Date | string): boolean {
  const d = parseLocalDate(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function isThisWeek(date: Date | string): boolean {
  const d = parseLocalDate(date);
  const today = new Date();
  // Reset today to start of day for accurate comparison
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const weekEnd = new Date(todayStart);
  weekEnd.setDate(todayStart.getDate() + (7 - todayStart.getDay()));
  // Set to end of day
  weekEnd.setHours(23, 59, 59, 999);

  return d >= todayStart && d <= weekEnd;
}

export function getDueDateColor(date: string | undefined): string {
  if (!date) return 'text-muted-foreground';
  if (isOverdue(date)) return 'text-red-500';
  if (isToday(date)) return 'text-green-500';
  if (isTomorrow(date)) return 'text-orange-500';
  if (isThisWeek(date)) return 'text-purple-500';
  return 'text-muted-foreground';
}

export function getDueDateLabel(date: string | undefined): string {
  if (!date) return '';
  if (isOverdue(date)) return 'Overdue';
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return formatDate(date);
}
