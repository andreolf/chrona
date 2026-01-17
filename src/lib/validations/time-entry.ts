import { z } from 'zod';

export const timeEntrySchema = z.object({
  date: z.date({ message: 'Date is required' }),
  project_id: z.string().uuid({ message: 'Please select a project' }),
  hours: z.number()
    .min(0.01, 'Hours must be greater than 0')
    .max(24, 'Hours cannot exceed 24'),
  description: z.string().optional(),
  deliverable_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

export type TimeEntryInput = z.infer<typeof timeEntrySchema>;
