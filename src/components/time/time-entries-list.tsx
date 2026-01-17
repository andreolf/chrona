'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { TimeEntry, Project, TimeEntryWithProject } from '@/lib/supabase/types';
import { deleteTimeEntry } from '@/lib/actions/time-entries';
import { TimeEntryForm } from './time-entry-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/app/empty-state';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { minutesToHours } from '@/lib/utils/date';
import {
  Timer,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  FolderKanban,
} from 'lucide-react';

interface TimeEntriesListProps {
  entries: TimeEntryWithProject[];
  projects: Project[];
  canEdit?: boolean;
}

export function TimeEntriesList({
  entries,
  projects,
  canEdit = true,
}: TimeEntriesListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<TimeEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, TimeEntryWithProject[]>);

  const handleDelete = async () => {
    if (!deletingEntry) return;
    
    setIsDeleting(true);
    const result = await deleteTimeEntry(deletingEntry.id);
    setIsDeleting(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    toast({
      title: 'Entry deleted',
      description: 'Your time entry has been deleted.',
    });
    setDeletingEntry(null);
    router.refresh();
  };

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Timer}
        title="No time entries yet"
        description="Start logging your time to see entries here"
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedEntries).map(([date, dayEntries]) => {
          const totalMinutes = dayEntries.reduce((sum, e) => sum + e.minutes, 0);
          
          return (
            <div key={date} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-400">
                  {format(parseISO(date), 'EEEE, MMMM d')}
                </h3>
                <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                  {minutesToHours(totalMinutes)}
                </Badge>
              </div>

              <div className="space-y-2">
                {dayEntries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="bg-slate-800/30 border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FolderKanban className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-medium text-white">
                              {entry.project?.name || 'Unknown Project'}
                            </span>
                          </div>
                          {entry.description && (
                            <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                              {entry.description}
                            </p>
                          )}
                          {entry.deliverable_url && (
                            <a
                              href={entry.deliverable_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Deliverable
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className="bg-slate-700 text-white font-mono">
                            {minutesToHours(entry.minutes)}
                          </Badge>
                          
                          {canEdit && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-400 hover:text-white"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-slate-900 border-slate-800"
                              >
                                <DropdownMenuItem
                                  onClick={() => setEditingEntry(entry)}
                                  className="text-slate-300 focus:bg-slate-800 focus:text-white"
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeletingEntry(entry)}
                                  className="text-red-400 focus:bg-red-950/50 focus:text-red-400"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {editingEntry && (
        <TimeEntryForm
          open={!!editingEntry}
          onOpenChange={(open) => !open && setEditingEntry(null)}
          projects={projects}
          entry={editingEntry}
          onSuccess={() => {
            setEditingEntry(null);
            router.refresh();
          }}
        />
      )}

      <AlertDialog open={!!deletingEntry} onOpenChange={(open) => !open && setDeletingEntry(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete time entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete the time entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
