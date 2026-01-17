import { Suspense } from 'react';
import { getDashboardStats } from '@/lib/actions/dashboard';
import { getProfile } from '@/lib/auth';
import { PageHeader } from '@/components/app/page-header';
import { StatCard } from '@/components/app/stat-card';
import { StatusBadge } from '@/components/app/status-badge';
import { DashboardSkeleton } from '@/components/app/loading-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatWeekRange } from '@/lib/utils/date';
import {
  Clock,
  FileText,
  CheckCircle2,
  Users,
  FolderKanban,
  Timer,
  ArrowRight,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';

async function AdminDashboard({ stats }: { stats: Awaited<ReturnType<typeof getDashboardStats>>['data'] }) {
  if (!stats) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Pending Reviews Alert */}
      {stats.pendingTimesheets > 0 && (
        <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 border-amber-700/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-amber-100 font-medium">
                    {stats.pendingTimesheets} timesheet{stats.pendingTimesheets > 1 ? 's' : ''} awaiting your review
                  </p>
                  <p className="text-amber-400/70 text-sm">Review and approve to keep your team unblocked</p>
                </div>
              </div>
              <Link href="/app/timesheets">
                <Button className="bg-amber-600 hover:bg-amber-500 text-white">
                  Review Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Team Hours This Week"
          value={`${stats.totalHours}h`}
          icon={Clock}
          description="Total logged by all members"
        />
        <StatCard
          title="Pending Review"
          value={stats.pendingTimesheets}
          icon={FileText}
          description="Timesheets awaiting approval"
        />
        <StatCard
          title="Approved This Week"
          value={stats.approvedThisWeek}
          icon={CheckCircle2}
          description="Timesheets approved"
        />
        <StatCard
          title="Team Members"
          value={stats.teamSize}
          icon={Users}
          description="Active freelancers"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Reviews */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Pending Reviews
            </CardTitle>
            <Link 
              href="/app/timesheets"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {stats.pendingForReview.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <p className="text-slate-400">All caught up!</p>
                <p className="text-slate-500 text-sm">No timesheets pending review</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.pendingForReview.map((ts: { id: string; week_start: string; user: { full_name: string; email: string } }) => (
                  <Link
                    key={ts.id}
                    href={`/app/timesheets/${ts.id}`}
                    className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-amber-500 to-orange-600">
                      <AvatarFallback className="text-white text-xs font-medium bg-transparent">
                        {getInitials(ts.user?.full_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white font-medium">{ts.user?.full_name}</p>
                      <p className="text-slate-400 text-sm">{formatWeekRange(ts.week_start)}</p>
                    </div>
                    <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30">
                      Pending
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Team This Week
            </CardTitle>
            <Link 
              href="/app/users"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Manage
            </Link>
          </CardHeader>
          <CardContent>
            {stats.teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No team members yet</p>
                <p className="text-slate-500 text-sm">Invite freelancers to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.teamMembers.slice(0, 5).map((member: { id: string; full_name: string; email: string; role: string; hours_this_week: number }) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg"
                  >
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-violet-600">
                      <AvatarFallback className="text-white text-xs font-medium bg-transparent">
                        {getInitials(member.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white font-medium">{member.full_name}</p>
                      <p className="text-slate-500 text-xs">{member.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono font-medium">{member.hours_this_week}h</p>
                      <p className="text-slate-500 text-xs">this week</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/app/projects">
              <Card className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border-indigo-500/30 hover:border-indigo-400/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-3">
                    <FolderKanban className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-semibold">Manage Projects</p>
                  <p className="text-indigo-300 text-sm">Assign freelancers</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/app/users">
              <Card className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-emerald-500/30 hover:border-emerald-400/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-semibold">Manage Team</p>
                  <p className="text-emerald-300 text-sm">View all members</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/app/timesheets">
              <Card className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-500/30 hover:border-amber-400/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-semibold">Review Timesheets</p>
                  <p className="text-amber-300 text-sm">Approve work</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function FreelancerDashboard({ stats }: { stats: Awaited<ReturnType<typeof getDashboardStats>>['data'] }) {
  if (!stats) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Current Status Alert */}
      {stats.currentTimesheetStatus === 'changes_requested' && (
        <Card className="bg-gradient-to-r from-orange-900/30 to-amber-900/20 border-orange-700/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-orange-100 font-medium">Changes requested on your timesheet</p>
                  <p className="text-orange-400/70 text-sm">Review the feedback and resubmit</p>
                </div>
              </div>
              <Link href="/app/timesheets">
                <Button className="bg-orange-600 hover:bg-orange-500 text-white">
                  View Feedback
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Hours This Week"
          value={`${stats.totalHours}h`}
          icon={Clock}
          description="Your logged hours"
        />
        <StatCard
          title="Current Timesheet"
          value={
            <StatusBadge 
              status={stats.currentTimesheetStatus as 'draft' | 'submitted' | 'changes_requested' | 'approved'} 
            />
          }
          icon={FileText}
          description="This week's status"
        />
        <StatCard
          title="Assigned Projects"
          value={stats.assignedProjects.length}
          icon={FolderKanban}
          description="Active assignments"
        />
        <Link href="/app/time" className="block">
          <Card className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border-indigo-500/30 hover:border-indigo-400/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center h-full">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-3">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-semibold">Quick Add Time</p>
              <p className="text-indigo-300 text-sm">Log a new entry</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Projects */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              My Projects
            </CardTitle>
            <Link 
              href="/app/projects"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {stats.assignedProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No projects assigned yet</p>
                <p className="text-slate-500 text-sm">Your admin will assign you to projects</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.assignedProjects.map((project: { id: string; name: string; description: string | null }) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{project.name}</p>
                      {project.description && (
                        <p className="text-slate-500 text-sm truncate">{project.description}</p>
                      )}
                    </div>
                    <Link href="/app/time">
                      <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300">
                        <Timer className="w-4 h-4 mr-1" />
                        Log
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Timesheets */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-400" />
              My Timesheets
            </CardTitle>
            <Link 
              href="/app/timesheets"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentTimesheets.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No timesheets yet</p>
                <p className="text-slate-500 text-sm">Start logging time to create your first timesheet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentTimesheets.slice(0, 4).map((timesheet: { id: string; week_start: string; status: string }) => (
                  <Link
                    key={timesheet.id}
                    href={`/app/timesheets/${timesheet.id}`}
                    className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {formatWeekRange(timesheet.week_start)}
                      </p>
                    </div>
                    <StatusBadge status={timesheet.status as 'draft' | 'submitted' | 'changes_requested' | 'approved'} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips for Freelancers */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border-slate-700">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Weekly Workflow</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Log your time entries throughout the week, then submit your timesheet for review. 
                Your admin will approve or request changes. Keep deliverable links handy for faster approvals!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function DashboardContent() {
  const profile = await getProfile();
  const { data: stats, error } = await getDashboardStats();

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Failed to load dashboard data</p>
      </div>
    );
  }

  if (stats.isAdmin) {
    return <AdminDashboard stats={stats} />;
  }

  return <FreelancerDashboard stats={stats} />;
}

export default async function DashboardPage() {
  const profile = await getProfile();
  const isAdmin = profile?.role === 'admin';
  
  return (
    <>
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'User'}`}
        description={isAdmin 
          ? "Manage your team and review their work" 
          : "Track your time and manage deliverables"
        }
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
