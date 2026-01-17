'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import { formatDateForDB, getWeekStart } from '@/lib/utils/date';

export async function getOrCreateTimesheet(weekStart: Date) {
  const profile = await getProfile();
  if (!profile || !profile.org_id) {
    return { error: 'Not authenticated' };
  }

  const supabase = await createClient();
  const weekStartStr = formatDateForDB(weekStart);

  // Try to get existing timesheet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('timesheets')
    .select('*')
    .eq('user_id', profile.id)
    .eq('week_start', weekStartStr)
    .single();

  if (existing) {
    return { data: existing };
  }

  // Create new timesheet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newTimesheet, error } = await (supabase as any)
    .from('timesheets')
    .insert({
      org_id: profile.org_id,
      user_id: profile.id,
      week_start: weekStartStr,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: newTimesheet };
}

export async function updateTimesheetSummary(timesheetId: string, summary: string) {
  const profile = await getProfile();
  if (!profile) {
    return { error: 'Not authenticated' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('timesheets')
    .update({ summary })
    .eq('id', timesheetId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/timesheets');
  return { success: true };
}

export async function submitTimesheet(timesheetId: string) {
  const profile = await getProfile();
  if (!profile) {
    return { error: 'Not authenticated' };
  }

  const supabase = await createClient();

  // Get timesheet details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: timesheet } = await (supabase as any)
    .from('timesheets')
    .select('*')
    .eq('id', timesheetId)
    .single();

  if (!timesheet) {
    return { error: 'Timesheet not found' };
  }

  if (timesheet.status !== 'draft' && timesheet.status !== 'changes_requested') {
    return { error: 'Timesheet cannot be submitted' };
  }

  // Update timesheet status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('timesheets')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', timesheetId);

  if (error) {
    return { error: error.message };
  }

  // Link time entries to this timesheet
  const weekEnd = new Date(timesheet.week_start);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('time_entries')
    .update({ timesheet_id: timesheetId })
    .eq('user_id', profile.id)
    .gte('date', timesheet.week_start)
    .lte('date', formatDateForDB(weekEnd))
    .is('timesheet_id', null);

  revalidatePath('/app/timesheets');
  revalidatePath('/app/dashboard');
  return { success: true };
}

export async function approveTimesheet(timesheetId: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Not authorized' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('timesheets')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: profile.id,
    })
    .eq('id', timesheetId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/timesheets');
  revalidatePath('/app/dashboard');
  return { success: true };
}

export async function requestChanges(timesheetId: string, comment: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Not authorized' };
  }

  const supabase = await createClient();

  // Update status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: statusError } = await (supabase as any)
    .from('timesheets')
    .update({ status: 'changes_requested' })
    .eq('id', timesheetId);

  if (statusError) {
    return { error: statusError.message };
  }

  // Get timesheet org_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: timesheet } = await (supabase as any)
    .from('timesheets')
    .select('org_id')
    .eq('id', timesheetId)
    .single();

  if (!timesheet) {
    return { error: 'Timesheet not found' };
  }

  // Add comment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: commentError } = await (supabase as any)
    .from('timesheet_comments')
    .insert({
      org_id: timesheet.org_id,
      timesheet_id: timesheetId,
      author_id: profile.id,
      body: comment,
    });

  if (commentError) {
    return { error: commentError.message };
  }

  revalidatePath('/app/timesheets');
  return { success: true };
}

export async function addComment(timesheetId: string, body: string) {
  const profile = await getProfile();
  if (!profile || !profile.org_id) {
    return { error: 'Not authenticated' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('timesheet_comments')
    .insert({
      org_id: profile.org_id,
      timesheet_id: timesheetId,
      author_id: profile.id,
      body,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/timesheets');
  return { success: true };
}

export async function getTimesheets(status?: string) {
  const profile = await getProfile();
  if (!profile || !profile.org_id) {
    return { error: 'Not authenticated', data: [] };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('timesheets')
    .select('*, user:profiles(*)')
    .order('week_start', { ascending: false });

  // If admin, get all timesheets in org
  if (profile.role === 'admin') {
    query = query.eq('org_id', profile.org_id);
  } else {
    query = query.eq('user_id', profile.id);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

export async function getTimesheetWithDetails(timesheetId: string) {
  const profile = await getProfile();
  if (!profile) {
    return { error: 'Not authenticated' };
  }

  const supabase = await createClient();

  // Get timesheet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: timesheet, error: tsError } = await (supabase as any)
    .from('timesheets')
    .select('*, user:profiles(*)')
    .eq('id', timesheetId)
    .single();

  if (tsError || !timesheet) {
    return { error: 'Timesheet not found' };
  }

  // Get time entries
  const weekEnd = new Date(timesheet.week_start);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: entries } = await (supabase as any)
    .from('time_entries')
    .select('*, project:projects(*)')
    .eq('user_id', timesheet.user_id)
    .gte('date', timesheet.week_start)
    .lte('date', formatDateForDB(weekEnd))
    .order('date', { ascending: true });

  // Get comments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: comments } = await (supabase as any)
    .from('timesheet_comments')
    .select('*, author:profiles(*)')
    .eq('timesheet_id', timesheetId)
    .order('created_at', { ascending: true });

  return {
    data: {
      ...timesheet,
      entries: entries || [],
      comments: comments || [],
    },
  };
}

export async function getCurrentWeekTimesheet() {
  const profile = await getProfile();
  if (!profile || !profile.org_id) {
    return { error: 'Not authenticated' };
  }

  const weekStart = getWeekStart(new Date());
  return getOrCreateTimesheet(weekStart);
}
