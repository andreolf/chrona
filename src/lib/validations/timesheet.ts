import { z } from 'zod';

export const timesheetSchema = z.object({
  summary: z.string().optional(),
});

export const timesheetCommentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty'),
});

export type TimesheetInput = z.infer<typeof timesheetSchema>;
export type TimesheetCommentInput = z.infer<typeof timesheetCommentSchema>;
