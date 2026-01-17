import { startOfWeek, endOfWeek, format, parseISO, addDays } from 'date-fns';

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

export function getWeekEnd(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1 }); // Sunday
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
}

export function formatWeekRange(weekStart: Date | string): string {
  const start = typeof weekStart === 'string' ? parseISO(weekStart) : weekStart;
  const end = addDays(start, 6);
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
}

export function formatDateForDB(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function minutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

export function getWeekDays(weekStart: Date | string): Date[] {
  const start = typeof weekStart === 'string' ? parseISO(weekStart) : weekStart;
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
