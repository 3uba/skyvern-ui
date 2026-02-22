'use client';

import type { TimelineEntry } from './types';
import { TimelineBlockItem } from './timeline-block';
import { ListChecks } from 'lucide-react';

export function TimelineSection({
  timeline,
}: {
  timeline: TimelineEntry[];
}) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <ListChecks className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No timeline data — this run had no steps.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {timeline.map((entry, i) => (
        <TimelineBlockItem key={i} entry={entry} />
      ))}
    </div>
  );
}
