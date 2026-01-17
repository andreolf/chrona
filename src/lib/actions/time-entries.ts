'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import { hoursToMinutes, formatDateForDB } from '@/lib/utils/date';

interface CreateTimeEntryInput {
  date: Date;
  project_id: string;
  hours: number;
  description?: string;
  deliverable_url?: string;
}

interface UpdateTimeEntryInput extends CreateTimeEntryInput {
  id: string;
}

export async function createTimeEntry(input: CreateTimeEntryInput) {
  const profile = await getProfile();
  if (!profile || !profile.org_id) {
    return { error: 'Not authenticated' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('time_entries').insert({
    org_id: profile.org_id,
    user_id: profile.id,
    project_id: input.project_id,
    date: formatDateForDB(input.date),
    minutes: hoursToMinutes(input.hours),
    description: input.description || null,
    deliverable_url: input.deliverable_url || null,
    source: 'manual',
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/time');
  revalidatePath('/app/dashboard');
  return { success: true };
}

export async function updateTimeEntry(input: UpdateTimeEntryInput) {
  const profile = await getProfile();
  if (!profile) {
    return { error: 'Not authenticated' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('time_entries')
    .update({
      project_id: input.project_id,
      date: formatDateForDB(input.date),
      minutes: hoursToMinutes(input.hours),
      description: input.description || null,
      deliverable_url: input.deliverable_url || null,
    })
    .eq('id', input.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/time');
  revalidatePath('/app/dashboard');
  return { success: true };
}

export async function deleteTimeEntry(id: string) {
  const profile = await getProfile();
  if (!profile) {
    return { error: 'Not authenticated' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('time_entries')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/time');
  revalidatePath('/app/dashboard');
  return { success: true };
}

export async function getTimeEntries(weekStart?: Date, projectId?: string) {
  const profile = await getProfile();
  if (!profile || !profile.org_id) {
    return { error: 'Not authenticated', data: [] };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('time_entries')
    .select('*, project:projects(*)')
    .eq('user_id', profile.id)
    .order('date', { ascending: false });

  if (weekStart) {
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6);
    query = query
      .gte('date', formatDateForDB(weekStart))
      .lte('date', formatDateForDB(endDate));
  }

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

export async function getAllTimeEntries(weekStart?: Date, projectId?: string, userId?: string) {
  const profile = await getProfile();
  if (!profile || !profile.org_id || profile.role !== 'admin') {
    return { error: 'Not authorized', data: [] };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('time_entries')
    .select('*, project:projects(*), user:profiles(*)')
    .eq('org_id', profile.org_id)
    .order('date', { ascending: false });

  if (weekStart) {
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6);
    query = query
      .gte('date', formatDateForDB(weekStart))
      .lte('date', formatDateForDB(endDate));
  }

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}
