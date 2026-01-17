'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';

interface CreateProjectInput {
  name: string;
  description?: string;
}

interface UpdateProjectInput extends CreateProjectInput {
  id: string;
}

export async function createProject(input: CreateProjectInput) {
  const profile = await getProfile();
  if (!profile || !profile.org_id || profile.role !== 'admin') {
    return { error: 'Not authorized' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('projects').insert({
    org_id: profile.org_id,
    name: input.name,
    description: input.description || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/projects');
  return { success: true };
}

export async function updateProject(input: UpdateProjectInput) {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Not authorized' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('projects')
    .update({
      name: input.name,
      description: input.description || null,
    })
    .eq('id', input.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/projects');
  return { success: true };
}

export async function archiveProject(id: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Not authorized' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('projects')
    .update({ status: 'archived' })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/projects');
  return { success: true };
}

export async function restoreProject(id: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Not authorized' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('projects')
    .update({ status: 'active' })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/projects');
  return { success: true };
}

export async function getProjects(includeArchived = false) {
  const profile = await getProfile();
  if (!profile || !profile.org_id) {
    return { error: 'Not authenticated', data: [] };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('projects')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('name');

  if (!includeArchived) {
    query = query.eq('status', 'active');
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

export async function getAssignedProjects() {
  const profile = await getProfile();
  if (!profile || !profile.org_id) {
    return { error: 'Not authenticated', data: [] };
  }

  const supabase = await createClient();

  // Admins see all active projects, freelancers only see assigned ones
  if (profile.role === 'admin') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('projects')
      .select('*')
      .eq('org_id', profile.org_id)
      .eq('status', 'active')
      .order('name');

    if (error) {
      return { error: error.message, data: [] };
    }
    return { data: data || [] };
  }

  // For freelancers, get projects they're assigned to
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('project_members')
    .select('project:projects(*)')
    .eq('user_id', profile.id);

  if (error) {
    return { error: error.message, data: [] };
  }

  // Extract projects from the join and filter active ones
  const projects = (data || [])
    .map((pm: { project: { status: string } }) => pm.project)
    .filter((p: { status: string }) => p && p.status === 'active');

  return { data: projects };
}

export async function getProjectMembers(projectId: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Not authorized', data: [] };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('project_members')
    .select('*, user:profiles(*)')
    .eq('project_id', projectId);

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}

export async function addProjectMember(projectId: string, userId: string, hourlyRate?: number) {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Not authorized' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('project_members').insert({
    project_id: projectId,
    user_id: userId,
    hourly_rate: hourlyRate || null,
  });

  if (error) {
    if (error.code === '23505') {
      return { error: 'User is already assigned to this project' };
    }
    return { error: error.message };
  }

  revalidatePath('/app/projects');
  return { success: true };
}

export async function removeProjectMember(projectId: string, userId: string) {
  const profile = await getProfile();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Not authorized' };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/app/projects');
  return { success: true };
}
