'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { timeEntrySchema, TimeEntryInput } from '@/lib/validations/time-entry';
import { createTimeEntry, updateTimeEntry } from '@/lib/actions/time-entries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Project, TimeEntry } from '@/lib/supabase/types';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  entry?: TimeEntry;
  onSuccess?: () => void;
}

export function TimeEntryForm({
  open,
  onOpenChange,
  projects,
  entry,
  onSuccess,
}: TimeEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!entry;

  const form = useForm<TimeEntryInput>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      date: entry ? new Date(entry.date) : new Date(),
      project_id: entry?.project_id || '',
      hours: entry ? entry.minutes / 60 : 0,
      description: entry?.description || '',
      deliverable_url: entry?.deliverable_url || '',
    },
  });

  const onSubmit = async (data: TimeEntryInput) => {
    setIsLoading(true);

    const result = isEditing
      ? await updateTimeEntry({ ...data, id: entry.id })
      : await createTimeEntry(data);

    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      return;
    }

    toast({
      title: isEditing ? 'Entry updated' : 'Entry created',
      description: isEditing
        ? 'Your time entry has been updated.'
        : 'Your time entry has been logged.',
    });

    form.reset();
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Time Entry' : 'Log Time Entry'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4 items-start">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-slate-300">Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full h-9 pl-3 text-left font-normal bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:text-white',
                              !field.value && 'text-slate-500'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-slate-900 border-slate-800"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('2020-01-01')
                          }
                          initialFocus
                          className="bg-slate-900"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-slate-300">Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 2 or 1.5"
                        className="bg-slate-800/50 border-slate-700 text-white h-9"
                        value={field.value || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Allow empty, numbers, and decimals
                          if (val === '' || /^\d*\.?\d*$/.test(val)) {
                            field.onChange(val === '' ? 0 : parseFloat(val) || 0);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Project</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-900 border-slate-800 z-50">
                      {projects.length === 0 ? (
                        <div className="p-3 text-center text-slate-400 text-sm">
                          No projects assigned
                        </div>
                      ) : (
                        projects.map((project) => (
                          <SelectItem
                            key={project.id}
                            value={project.id}
                            className="text-white focus:bg-slate-800 focus:text-white cursor-pointer"
                          >
                            {project.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you work on?"
                      className="bg-slate-800/50 border-slate-700 text-white resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliverable_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">
                    Deliverable URL <span className="text-slate-500">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://..."
                      className="bg-slate-800/50 border-slate-700 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  'Update Entry'
                ) : (
                  'Log Entry'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
