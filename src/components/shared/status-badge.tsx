'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  completed: 'bg-success/15 text-success border-success/30',
  success: 'bg-success/15 text-success border-success/30',
  running: 'bg-primary/15 text-primary border-primary/30 animate-pulse',
  queued: 'bg-warning/15 text-warning border-warning/30',
  pending: 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30',
  failed: 'bg-destructive/15 text-destructive border-destructive/30',
  terminated: 'bg-destructive/15 text-destructive border-destructive/30',
  cancelled: 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30',
  canceled: 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30',
  created: 'bg-primary/15 text-primary border-primary/30',
  timed_out: 'bg-warning/15 text-warning border-warning/30',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const normalized = status.toLowerCase().replace(/ /g, '_');
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium capitalize', statusStyles[normalized], className)}
    >
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
