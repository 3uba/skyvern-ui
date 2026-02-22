'use client';

import type { TimelineEntry } from '@/components/runs/types';
import { UserCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HumanInteractionBannerProps {
  timeline: TimelineEntry[];
  appUrl?: string | null;
}

export function HumanInteractionBanner({ timeline, appUrl }: HumanInteractionBannerProps) {
  // Find any human_interaction block that is currently running/pending
  const pendingHumanBlock = findPendingHumanBlock(timeline);
  if (!pendingHumanBlock) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-900/50 dark:bg-violet-950/20">
      <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
      <div className="flex-1">
        <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
          Waiting for Human Review
        </p>
        <p className="text-xs text-violet-700/80 dark:text-violet-300/80">
          The workflow has paused at block &quot;{pendingHumanBlock.label || 'Human Review'}&quot; and is waiting for a human to review and approve before continuing.
        </p>
      </div>
      {appUrl && (
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <a href={appUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-3 w-3" />
            Review in Skyvern
          </a>
        </Button>
      )}
    </div>
  );
}

function findPendingHumanBlock(
  entries: TimelineEntry[],
): { label: string | null } | null {
  for (const entry of entries) {
    if (
      entry.type === 'block' &&
      entry.block?.block_type === 'human_interaction' &&
      (entry.block.status === 'running' || entry.block.status === null)
    ) {
      return { label: entry.block.label };
    }
    if (entry.children?.length) {
      const found = findPendingHumanBlock(entry.children);
      if (found) return found;
    }
  }
  return null;
}
