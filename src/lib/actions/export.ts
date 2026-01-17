'use server';

import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import { formatDateForDB, formatDate, minutesToHours } from '@/lib/utils/date';

interface TimesheetRow {
  user_id: string;
  week_start: string;
}

interface TimeEntryRow {
  date: string;
  minutes: number;
  description: string | null;
  deliverable_url: string | null;
  project?: { name: string };
  user?: { full_name: string };
}

export async function exportTimesheetCSV(timesheetId: string) {
  const profile = await getProfile();
  if (!profile) {
    return { error: 'Not authenticated' };
  }

  const supabase = await createClient();

  // Get timesheet with entries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: timesheet } = await (supabase as any)
    .from('timesheets')
    .select('*, user:profiles(*)')
    .eq('id', timesheetId)
    .single() as { data: TimesheetRow | null };

  if (!timesheet) {
    return { error: 'Timesheet not found' };
  }

  // Check access
  if (profile.role !== 'admin' && timesheet.user_id !== profile.id) {
    return { error: 'Not authorized' };
  }

  const weekEnd = new Date(timesheet.week_start);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: entries } = await (supabase as any)
    .from('time_entries')
    .select('*, project:projects(*)')
    .eq('user_id', timesheet.user_id)
    .gte('date', timesheet.week_start)
    .lte('date', formatDateForDB(weekEnd))
    .order('date', { ascending: true }) as { data: TimeEntryRow[] | null };

  // Build CSV
  const headers = ['Date', 'Project', 'Hours', 'Description', 'Deliverable URL'];
  const rows = (entries || []).map((entry: TimeEntryRow) => [
    formatDate(entry.date),
    entry.project?.name || 'Unknown',
    minutesToHours(entry.minutes),
    entry.description || '',
    entry.deliverable_url || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return { data: csvContent };
}

export async function exportDateRangeCSV(startDate: Date, endDate: Date, userId?: string) {
  const profile = await getProfile();
  if (!profile || !profile.org_id || profile.role !== 'admin') {
    return { error: 'Not authorized' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('time_entries')
    .select('*, project:projects(*), user:profiles(*)')
    .eq('org_id', profile.org_id)
    .gte('date', formatDateForDB(startDate))
    .lte('date', formatDateForDB(endDate))
    .order('date', { ascending: true });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data: entries } = await query as { data: TimeEntryRow[] | null };

  // Build CSV
  const headers = ['Date', 'User', 'Project', 'Hours', 'Description', 'Deliverable URL'];
  const rows = (entries || []).map((entry: TimeEntryRow) => [
    formatDate(entry.date),
    entry.user?.full_name || 'Unknown',
    entry.project?.name || 'Unknown',
    minutesToHours(entry.minutes),
    entry.description || '',
    entry.deliverable_url || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return { data: csvContent };
}
