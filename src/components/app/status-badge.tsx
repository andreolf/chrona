import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type TimesheetStatus = 'draft' | 'submitted' | 'changes_requested' | 'approved';

interface StatusBadgeProps {
  status: TimesheetStatus;
  className?: string;
}

const statusConfig: Record<
  TimesheetStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-700/50 text-slate-300 border-slate-600',
  },
  submitted: {
    label: 'Pending Review',
    className: 'bg-amber-900/30 text-amber-400 border-amber-700/50',
  },
  changes_requested: {
    label: 'Changes Requested',
    className: 'bg-orange-900/30 text-orange-400 border-orange-700/50',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
