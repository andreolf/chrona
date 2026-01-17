'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { TimeEntryWithProject, Project } from '@/lib/supabase/types';
import { PageHeader } from '@/components/app/page-header';
import { TimeEntryForm } from '@/components/time/time-entry-form';
import { TimeEntriesList } from '@/components/time/time-entries-list';
import { TableSkeleton } from '@/components/app/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { minutesToHours, formatDateForDB } from '@/lib/utils/date';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TimePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [entries, setEntries] = useState<TimeEntryWithProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  
  const weekParam = searchParams.get('week');
  const [currentWeek, setCurrentWeek] = useState(() => {
    if (weekParam) {
      return new Date(weekParam);
    }
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    // Get current user and profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null };

    // Get projects - admins see all, freelancers see assigned only
    let projectsData: Project[] = [];
    
    if (profile?.role === 'admin') {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('name');
      projectsData = data || [];
    } else {
      // Freelancers only see assigned projects
      const { data } = await supabase
        .from('project_members')
        .select('project:projects(*)')
        .eq('user_id', user.id);
      
      projectsData = (data || [])
        .map((pm: { project: Project }) => pm.project)
        .filter((p: Project) => p && p.status === 'active');
    }

    setProjects(projectsData);

    // Get time entries for the week
    const weekStart = formatDateForDB(currentWeek);
    const weekEnd = new Date(currentWeek);
    weekEnd.setDate(weekEnd.getDate() + 6);

    let query = supabase
      .from('time_entries')
      .select('*, project:projects(*)')
      .eq('user_id', user.id)
      .gte('date', weekStart)
      .lte('date', formatDateForDB(weekEnd))
      .order('date', { ascending: false });

    if (selectedProject !== 'all') {
      query = query.eq('project_id', selectedProject);
    }

    const { data: entriesData } = await query;
    setEntries((entriesData as TimeEntryWithProject[]) || []);
    setIsLoading(false);
  }, [currentWeek, selectedProject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = direction === 'prev' 
      ? subWeeks(currentWeek, 1) 
      : addWeeks(currentWeek, 1);
    setCurrentWeek(newWeek);
    router.push(`/app/time?week=${format(newWeek, 'yyyy-MM-dd')}`);
  };

  const totalMinutes = entries.reduce((sum, e) => sum + e.minutes, 0);

  return (
    <>
      <PageHeader
        title="Time Entries"
        description="Log and manage your work hours"
        actions={
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Time
          </Button>
        }
      />

      <div className="space-y-6 animate-fade-in">
        {/* Week Navigation */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWeek('prev')}
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <h3 className="text-white font-medium">
                    {format(currentWeek, 'MMM d')} - {format(addWeeks(currentWeek, 0).setDate(currentWeek.getDate() + 6) && new Date(currentWeek.getTime() + 6 * 24 * 60 * 60 * 1000), 'MMM d, yyyy')}
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWeek('next')}
                  disabled={addWeeks(currentWeek, 1) > new Date()}
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="all" className="text-white focus:bg-slate-800">
                      All projects
                    </SelectItem>
                    {projects.map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id}
                        className="text-white focus:bg-slate-800"
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 text-base px-4 py-2">
                  Total: {minutesToHours(totalMinutes)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Entries */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={5} />
            ) : (
              <TimeEntriesList 
                entries={entries} 
                projects={projects}
                canEdit={true}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <TimeEntryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        projects={projects}
        onSuccess={() => {
          setIsFormOpen(false);
          fetchData();
        }}
      />
    </>
  );
}
