'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';

export async function getUsers() {
  const profile = await getProfile();
  if (!profile || !profile.org_id || profile.role !== 'admin') {
    return { error: 'Not authorized', data: [] };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('full_name');

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

export async function updateUserRole(userId: string, role: 'admin' | 'freelancer') {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Not authorized' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/users');
  return { success: true };
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Not authorized' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/users');
  return { success: true };
}
