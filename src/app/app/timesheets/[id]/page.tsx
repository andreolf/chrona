'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import {
  submitTimesheet,
  approveTimesheet,
  requestChanges,
  updateTimesheetSummary,
  addComment,
} from '@/lib/actions/timesheets';
import { exportTimesheetCSV } from '@/lib/actions/export';
import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
import { TableSkeleton } from '@/components/app/loading-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatWeekRange, minutesToHours, formatDateForDB } from '@/lib/utils/date';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  XCircle,
  Download,
  MessageSquare,
  Loader2,
  FolderKanban,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface TimesheetDetails {
  id: string;
  week_start: string;
  status: 'draft' | 'submitted' | 'changes_requested' | 'approved';
  summary: string | null;
  user_id: string;
  user: {
    full_name: string;
    email: string;
  };
  entries: Array<{
    id: string;
    date: string;
    minutes: number;
    description: string | null;
    deliverable_url: string | null;
    project: {
      name: string;
    };
  }>;
  comments: Array<{
    id: string;
    body: string;
    created_at: string;
    author: {
      full_name: string;
    };
  }>;
}

export default function TimesheetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [timesheet, setTimesheet] = useState<TimesheetDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [summary, setSummary] = useState('');
  const [comment, setComment] = useState('');
  const [changesComment, setChangesComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [isSavingSummary, setIsSavingSummary] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    setIsAdmin(profile?.role === 'admin');

    // Get timesheet with details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ts } = await (supabase as any)
      .from('timesheets')
      .select('*, user:profiles!timesheets_user_id_fkey(*)')
      .eq('id', params.id)
      .single();

    if (!ts) {
      router.push('/app/timesheets');
      return;
    }

    setIsCurrentUser(ts.user_id === user.id);

    // Get entries
    const weekEnd = new Date(ts.week_start);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: entries } = await (supabase as any)
      .from('time_entries')
      .select('*, project:projects(*)')
      .eq('user_id', ts.user_id)
      .gte('date', ts.week_start)
      .lte('date', formatDateForDB(weekEnd))
      .order('date', { ascending: true });

    // Get comments
    const { data: comments } = await supabase
      .from('timesheet_comments')
      .select('*, author:profiles!timesheet_comments_author_id_fkey(*)')
      .eq('timesheet_id', params.id)
      .order('created_at', { ascending: true });

    setTimesheet({
      ...ts,
      entries: entries || [],
      comments: comments || [],
    } as TimesheetDetails);
    setSummary(ts.summary || '');
    setIsLoading(false);
  }, [params.id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!timesheet) return;
    setIsSubmitting(true);

    // Save summary first
    if (summary !== timesheet.summary) {
      await updateTimesheetSummary(timesheet.id, summary);
    }

    const result = await submitTimesheet(timesheet.id);
    setIsSubmitting(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    toast({
      title: 'Timesheet submitted',
      description: 'Your timesheet has been submitted for review.',
    });
    fetchData();
  };

  const handleApprove = async () => {
    if (!timesheet) return;
    setIsSubmitting(true);

    const result = await approveTimesheet(timesheet.id);
    setIsSubmitting(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    toast({
      title: 'Timesheet approved',
      description: 'The timesheet has been approved.',
    });
    fetchData();
  };

  const handleRequestChanges = async () => {
    if (!timesheet || !changesComment.trim()) return;
    setIsSubmitting(true);

    const result = await requestChanges(timesheet.id, changesComment);
    setIsSubmitting(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    toast({
      title: 'Changes requested',
      description: 'The freelancer has been notified.',
    });
    setShowChangesDialog(false);
    setChangesComment('');
    fetchData();
  };

  const handleAddComment = async () => {
    if (!timesheet || !comment.trim()) return;

    const result = await addComment(timesheet.id, comment);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    setComment('');
    fetchData();
  };

  const handleSaveSummary = async () => {
    if (!timesheet) return;
    setIsSavingSummary(true);

    const result = await updateTimesheetSummary(timesheet.id, summary);
    setIsSavingSummary(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    toast({
      title: 'Summary saved',
      description: 'Your delivery summary has been saved.',
    });
  };

  const handleExport = async () => {
    if (!timesheet) return;

    const result = await exportTimesheetCSV(timesheet.id);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    // Download CSV
    const blob = new Blob([result.data!], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${timesheet.week_start}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Loading..." />
        <TableSkeleton rows={5} />
      </>
    );
  }

  if (!timesheet) {
    return null;
  }

  const totalMinutes = timesheet.entries.reduce((sum, e) => sum + e.minutes, 0);
  const canEdit = isCurrentUser && (timesheet.status === 'draft' || timesheet.status === 'changes_requested');
  const canSubmit = canEdit && timesheet.entries.length > 0;
  const canReview = isAdmin && timesheet.status === 'submitted';

  // Group entries by date
  const groupedEntries = timesheet.entries.reduce((groups, entry) => {
    if (!groups[entry.date]) {
      groups[entry.date] = [];
    }
    groups[entry.date].push(entry);
    return groups;
  }, {} as Record<string, typeof timesheet.entries>);

  return (
    <>
      <PageHeader
        title={
          <div className="flex items-center gap-4">
            <Link href="/app/timesheets">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <span>
              {isAdmin && !isCurrentUser ? timesheet.user.full_name : 'My Timesheet'}
            </span>
          </div>
        }
        description={formatWeekRange(timesheet.week_start)}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={timesheet.status} />
            <Button
              variant="outline"
              onClick={handleExport}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Delivery Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {canEdit ? (
                <div className="space-y-3">
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Describe what you delivered this week..."
                    className="bg-slate-800/50 border-slate-700 text-white resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveSummary}
                      disabled={isSavingSummary}
                      variant="outline"
                      size="sm"
                      className="bg-slate-800 border-slate-700"
                    >
                      {isSavingSummary ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-300">
                  {timesheet.summary || 'No summary provided'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Time Entries */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Time Entries</CardTitle>
              <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30">
                Total: {minutesToHours(totalMinutes)}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedEntries).map(([date, entries]) => {
                  const dayTotal = entries.reduce((sum, e) => sum + e.minutes, 0);
                  
                  return (
                    <div key={date} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-400">
                          {format(parseISO(date), 'EEEE, MMMM d')}
                        </h4>
                        <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                          {minutesToHours(dayTotal)}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-3 bg-slate-800/30 rounded-lg"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <FolderKanban className="w-4 h-4 text-indigo-400" />
                                  <span className="text-sm font-medium text-white">
                                    {entry.project?.name}
                                  </span>
                                </div>
                                {entry.description && (
                                  <p className="text-slate-400 text-sm">
                                    {entry.description}
                                  </p>
                                )}
                                {entry.deliverable_url && (
                                  <a
                                    href={entry.deliverable_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Deliverable
                                  </a>
                                )}
                              </div>
                              <Badge className="bg-slate-700 text-white font-mono">
                                {minutesToHours(entry.minutes)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {(canSubmit || canReview) && (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canSubmit && (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Submit for Review
                  </Button>
                )}
                {canReview && (
                  <>
                    <Button
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-500"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => setShowChangesDialog(true)}
                      variant="outline"
                      className="w-full border-orange-600 text-orange-400 hover:bg-orange-950/50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Request Changes
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {timesheet.comments.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">
                  No comments yet
                </p>
              ) : (
                <div className="space-y-4">
                  {timesheet.comments.map((c) => (
                    <div key={c.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 bg-gradient-to-br from-indigo-500 to-violet-600">
                          <AvatarFallback className="text-white text-xs bg-transparent">
                            {getInitials(c.author.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-white">
                          {c.author.full_name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(parseISO(c.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm pl-8">{c.body}</p>
                    </div>
                  ))}
                </div>
              )}

              <Separator className="bg-slate-800" />

              <div className="space-y-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="bg-slate-800/50 border-slate-700 text-white resize-none"
                  rows={2}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  size="sm"
                  className="w-full bg-slate-700 hover:bg-slate-600"
                >
                  Post Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Request Changes Dialog */}
      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
          </DialogHeader>
          <Textarea
            value={changesComment}
            onChange={(e) => setChangesComment(e.target.value)}
            placeholder="Explain what changes are needed..."
            className="bg-slate-800/50 border-slate-700 text-white resize-none"
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowChangesDialog(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestChanges}
              disabled={!changesComment.trim() || isSubmitting}
              className="bg-orange-600 hover:bg-orange-500"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Request Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
