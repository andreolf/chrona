import { Suspense } from 'react';
import Link from 'next/link';
import { getTimesheets } from '@/lib/actions/timesheets';
import { getProfile } from '@/lib/auth';
import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { EmptyState } from '@/components/app/empty-state';
import { TableSkeleton } from '@/components/app/loading-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatWeekRange } from '@/lib/utils/date';
import { FileText, ChevronRight } from 'lucide-react';

async function TimesheetsContent() {
  const profile = await getProfile();
  const { data: timesheets } = await getTimesheets();
  const isAdmin = profile?.role === 'admin';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filterByStatus = (status?: string) => {
    if (!status || status === 'all') return timesheets;
    return timesheets.filter((t: { status: string }) => t.status === status);
  };

  const TimesheetsList = ({ items }: { items: typeof timesheets }) => {
    if (items.length === 0) {
      return (
        <EmptyState
          icon={FileText}
          title="No timesheets found"
          description="Timesheets will appear here once you start logging time"
        />
      );
    }

    return (
      <div className="space-y-3">
        {items.map((timesheet: { id: string; week_start: string; status: string; summary?: string; user?: { full_name: string } }) => (
          <Link
            key={timesheet.id}
            href={`/app/timesheets/${timesheet.id}`}
            className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors group"
          >
            {isAdmin && (
              <Avatar className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-violet-600">
                <AvatarFallback className="text-white text-xs font-medium bg-transparent">
                  {getInitials(timesheet.user?.full_name || 'U')}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <p className="text-white font-medium">
                    {timesheet.user?.full_name}
                  </p>
                )}
                <p className={isAdmin ? 'text-slate-400 text-sm' : 'text-white font-medium'}>
                  {formatWeekRange(timesheet.week_start)}
                </p>
              </div>
              {timesheet.summary && (
                <p className="text-slate-500 text-sm truncate mt-1">
                  {timesheet.summary}
                </p>
              )}
            </div>
            <StatusBadge status={timesheet.status as 'draft' | 'submitted' | 'changes_requested' | 'approved'} />
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </Link>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-white">
          {isAdmin ? 'All Timesheets' : 'My Timesheets'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">
              All
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="submitted" className="data-[state=active]:bg-slate-700">
                Pending Review
              </TabsTrigger>
            )}
            <TabsTrigger value="draft" className="data-[state=active]:bg-slate-700">
              Draft
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-slate-700">
              Approved
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <TimesheetsList items={filterByStatus()} />
          </TabsContent>
          {isAdmin && (
            <TabsContent value="submitted" className="mt-6">
              <TimesheetsList items={filterByStatus('submitted')} />
            </TabsContent>
          )}
          <TabsContent value="draft" className="mt-6">
            <TimesheetsList items={filterByStatus('draft')} />
          </TabsContent>
          <TabsContent value="approved" className="mt-6">
            <TimesheetsList items={filterByStatus('approved')} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default function TimesheetsPage() {
  return (
    <>
      <PageHeader
        title="Timesheets"
        description="View and manage weekly timesheets"
      />
      <Suspense fallback={<TableSkeleton rows={5} />}>
        <TimesheetsContent />
      </Suspense>
    </>
  );
}
