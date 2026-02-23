'use client';

import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/lib/utils/format-date';
import { formatDuration } from '@/lib/utils/format-duration';
import type { Run } from './types';
import { Clock, Calendar, Layers } from 'lucide-react';

function getDuration(run: Run): string | null {
  if (!run.started_at || !run.finished_at) return null;
  const ms =
    new Date(run.finished_at).getTime() - new Date(run.started_at).getTime();
  return formatDuration(ms / 1000);
}

export function RunOverview({ run }: { run: Run }) {
  const duration = getDuration(run);

  return (
    <div className="flex flex-wrap gap-2">
      <Stat icon={Layers} label="Type" value={run.run_type?.replace(/_/g, ' ') || '-'} />
      <Stat icon={Layers} label="Steps" value={String(run.step_count ?? 0)} />
      {run.started_at && (
        <Stat icon={Calendar} label="Started" value={formatDate(run.started_at)} />
      )}
      {run.finished_at && (
        <Stat icon={Calendar} label="Finished" value={formatDate(run.finished_at)} />
      )}
      {duration && <Stat icon={Clock} label="Duration" value={duration} />}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium capitalize">{value}</span>
    </div>
  );
}
