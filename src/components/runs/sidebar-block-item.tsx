'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils/format-duration';
import { BLOCK_ICONS, BLOCK_COLORS, ACTION_ICONS, READABLE_ACTION_TYPES } from './constants';
import type { TimelineEntry } from './types';
import {
  Brain,
  ChevronDown,
  ChevronRight,
  ListChecks,
  MousePointerClick,
  Check,
  X,
} from 'lucide-react';

interface SidebarBlockItemProps {
  entry: TimelineEntry;
  depth?: number;
}

export function SidebarBlockItem({
  entry,
  depth = 0,
}: SidebarBlockItemProps) {
  const [expanded, setExpanded] = useState(depth < 1);
  const block = entry.block;
  const thought = entry.thought;

  // ── Thought card (compact) ───────────────────────────────────────────
  if (entry.type === 'thought' && thought) {
    return (
      <div className="flex gap-2 rounded-md border bg-card px-3 py-2">
        <Brain className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pink-500" />
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-relaxed line-clamp-2">
            {thought.thought}
          </p>
          {thought.answer && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
              → {thought.answer}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!block) return null;

  const hasChildren = entry.children && entry.children.length > 0;
  const hasActions = block.actions && block.actions.length > 0;
  const hasExpandable = hasChildren || hasActions;
  const Icon = BLOCK_ICONS[block.block_type] || ListChecks;
  const colorClass = BLOCK_COLORS[block.block_type] || BLOCK_COLORS.task;

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => hasExpandable && setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center gap-2 px-3 py-2 text-left transition-colors',
          hasExpandable && 'hover:bg-muted/30 cursor-pointer',
          !hasExpandable && 'cursor-default',
        )}
      >
        {/* Chevron */}
        <div className="w-3.5 shrink-0">
          {hasExpandable &&
            (expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            ))}
        </div>

        {/* Block type badge */}
        <div
          className={cn(
            'flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium',
            colorClass,
          )}
        >
          <Icon className="h-3 w-3" />
          {block.block_type.replace(/_/g, ' ')}
        </div>

        {/* Label */}
        <span className="flex-1 min-w-0 text-xs truncate">
          {block.label || ''}
        </span>

        {/* Status icon */}
        {block.status === 'completed' && (
          <Check className="h-3.5 w-3.5 shrink-0 text-success" />
        )}
        {(block.status === 'failed' || block.status === 'terminated') && (
          <X className="h-3.5 w-3.5 shrink-0 text-destructive" />
        )}
        {block.status === 'canceled' && (
          <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
      </button>

      {/* Expanded: actions + children only, NO output */}
      {expanded && hasExpandable && (
        <div className="border-t px-3 py-2 space-y-1.5">
          {/* Actions (compact inline) */}
          {hasActions &&
            block.actions.map((action, i) => {
              const AIcon =
                ACTION_ICONS[action.action_type] || MousePointerClick;
              const label =
                READABLE_ACTION_TYPES[action.action_type] || action.action_type;
              const isSuccess = action.status === 'completed';
              const isFailed = action.status === 'failed';

              return (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded border px-2 py-1.5"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-muted text-[9px] font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium">
                    <AIcon className="h-2.5 w-2.5" />
                    {label}
                  </span>
                  {isSuccess && (
                    <Check className="h-3 w-3 text-success ml-auto shrink-0" />
                  )}
                  {isFailed && (
                    <X className="h-3 w-3 text-destructive ml-auto shrink-0" />
                  )}
                  {action.reasoning && (
                    <span className="flex-1 min-w-0 text-[10px] text-muted-foreground truncate">
                      {action.reasoning}
                    </span>
                  )}
                </div>
              );
            })}

          {/* Children (recursive) */}
          {hasChildren && (
            <div className="space-y-1.5 pl-1 border-l border-muted ml-1">
              {entry.children.map((child, i) => (
                <SidebarBlockItem key={i} entry={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
