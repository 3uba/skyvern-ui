'use client';

import type { Run, TimelineEntry } from './types';
import { SidebarBlockItem } from './sidebar-block-item';
import { Layers, Zap } from 'lucide-react';

function countActions(entries: TimelineEntry[]): number {
  let count = 0;
  for (const entry of entries) {
    if (entry.block?.actions) {
      count += entry.block.actions.length;
    }
    if (entry.children) {
      count += countActions(entry.children);
    }
  }
  return count;
}

export function TimelineSidebar({
  run,
  timeline,
}: {
  run: Run;
  timeline: TimelineEntry[];
}) {
  const actionCount = countActions(timeline);

  return (
    <div className="flex flex-col h-full">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <Zap className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Actions</span>
          <span className="text-sm font-medium ml-auto">{actionCount}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Steps</span>
          <span className="text-sm font-medium ml-auto">
            {run.step_count ?? 0}
          </span>
        </div>
      </div>

      {/* Timeline entries */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No timeline data.
          </p>
        ) : (
          timeline.map((entry, i) => (
            <SidebarBlockItem key={i} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
