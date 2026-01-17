'use server';

import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import { getWeekStart, formatDateForDB } from '@/lib/utils/date';

export async function getDashboardStats() {
  const profile = await getProfile();
  if (!profile || !profile.org_id) {
    return { error: 'Not authenticated' };
  }

  const supabase = await createClient();
  const weekStart = getWeekStart(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const isAdmin = profile.role === 'admin';

  // Get this week's hours
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let hoursQuery = (supabase as any)
    .from('time_entries')
    .select('minutes')
    .gte('date', formatDateForDB(weekStart))
    .lte('date', formatDateForDB(weekEnd));

  if (!isAdmin) {
    hoursQuery = hoursQuery.eq('user_id', profile.id);
  } else {
    hoursQuery = hoursQuery.eq('org_id', profile.org_id);
  }

  const { data: entries } = await hoursQuery;
  const totalMinutes = entries?.reduce((sum: number, e: { minutes: number }) => sum + e.minutes, 0) || 0;
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Get pending timesheets count (for admin) or current status (for freelancer)
  let pendingTimesheets = 0;
  let approvedThisWeek = 0;
  let currentTimesheetStatus = 'draft';

  if (isAdmin) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: pending } = await (supabase as any)
      .from('timesheets')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', profile.org_id)
      .eq('status', 'submitted');
    pendingTimesheets = pending || 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: approved } = await (supabase as any)
      .from('timesheets')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', profile.org_id)
      .eq('status', 'approved')
      .gte('approved_at', formatDateForDB(weekStart));
    approvedThisWeek = approved || 0;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentTimesheet } = await (supabase as any)
      .from('timesheets')
      .select('status')
      .eq('user_id', profile.id)
      .eq('week_start', formatDateForDB(weekStart))
      .single();
    currentTimesheetStatus = currentTimesheet?.status || 'draft';
  }

  // Get recent timesheets (pending first for admin)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentTimesheetsQuery = (supabase as any)
    .from('timesheets')
    .select('*, user:profiles(*)')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (!isAdmin) {
    recentTimesheetsQuery = recentTimesheetsQuery.eq('user_id', profile.id);
  } else {
    recentTimesheetsQuery = recentTimesheetsQuery.eq('org_id', profile.org_id);
  }

  const { data: recentTimesheets } = await recentTimesheetsQuery;

  // Get active projects count
  const { count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', profile.org_id)
    .eq('status', 'active');

  // Get team size and team members (for admin)
  let teamSize = 1;
  let teamMembers: { id: string; full_name: string; email: string; role: string; hours_this_week: number }[] = [];
  
  if (isAdmin) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: members } = await (supabase as any)
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('org_id', profile.org_id)
      .eq('is_active', true)
      .order('full_name');
    
    teamSize = members?.length || 1;
    
    // Get hours for each team member this week
    if (members) {
      for (const member of members) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: memberEntries } = await (supabase as any)
          .from('time_entries')
          .select('minutes')
          .eq('user_id', member.id)
          .gte('date', formatDateForDB(weekStart))
          .lte('date', formatDateForDB(weekEnd));
        
        const memberMinutes = memberEntries?.reduce((sum: number, e: { minutes: number }) => sum + e.minutes, 0) || 0;
        teamMembers.push({
          ...member,
          hours_this_week: Math.round((memberMinutes / 60) * 10) / 10,
        });
      }
    }
  }

  // Get assigned projects for freelancer
  let assignedProjects: { id: string; name: string; description: string | null }[] = [];
  if (!isAdmin) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: projectMemberships } = await (supabase as any)
      .from('project_members')
      .select('project:projects(id, name, description)')
      .eq('user_id', profile.id);
    
    assignedProjects = (projectMemberships || [])
      .map((pm: { project: { id: string; name: string; description: string | null; status?: string } }) => pm.project)
      .filter((p: { status?: string }) => p && p.status !== 'archived');
  }

  // Get pending timesheets for admin review
  let pendingForReview: { id: string; week_start: string; user: { full_name: string; email: string } }[] = [];
  if (isAdmin) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pending } = await (supabase as any)
      .from('timesheets')
      .select('id, week_start, user:profiles(full_name, email)')
      .eq('org_id', profile.org_id)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: true })
      .limit(5);
    
    pendingForReview = pending || [];
  }

  return {
    data: {
      totalHours,
      pendingTimesheets,
      approvedThisWeek,
      currentTimesheetStatus,
      recentTimesheets: recentTimesheets || [],
      projectsCount: projectsCount || 0,
      teamSize,
      teamMembers,
      assignedProjects,
      pendingForReview,
      isAdmin,
    },
  };
}
