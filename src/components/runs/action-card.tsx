'use client';

import { cn } from '@/lib/utils';
import { ACTION_ICONS, READABLE_ACTION_TYPES } from './constants';
import type { Action } from './types';
import { MousePointerClick, X, Check } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  completed: 'border-l-success',
  failed: 'border-l-destructive',
  skipped: 'border-l-muted-foreground',
  pending: 'border-l-warning',
};

interface ActionCardProps {
  action: Action;
  index: number;
}

export function ActionCard({ action, index }: ActionCardProps) {
  const Icon = ACTION_ICONS[action.action_type] || MousePointerClick;
  const label = READABLE_ACTION_TYPES[action.action_type] || action.action_type;
  const statusColor = STATUS_COLORS[action.status] || 'border-l-muted';
  const isSuccess = action.status === 'completed';
  const isFailed = action.status === 'failed';

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border border-l-[3px] px-3 py-2.5 transition-colors hover:bg-muted/30',
        statusColor,
      )}
    >
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-medium text-muted-foreground">
        {index + 1}
      </span>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
            <Icon className="h-3 w-3" />
            {label}
          </span>
          {isSuccess && <Check className="h-3.5 w-3.5 text-success" />}
          {isFailed && <X className="h-3.5 w-3.5 text-destructive" />}
        </div>

        {action.reasoning && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {action.reasoning}
          </p>
        )}
        {!action.reasoning && action.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {action.description}
          </p>
        )}
      </div>
    </div>
  );
}
