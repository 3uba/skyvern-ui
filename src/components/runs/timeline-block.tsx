'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/status-badge';
import { JsonViewer } from '@/components/shared/json-viewer';
import { formatDuration } from '@/lib/utils/format-duration';
import { ActionCard } from './action-card';
import type { TimelineEntry } from './types';
import {
  Brain,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  ListChecks,
  Repeat,
  GitBranch,
  Code,
  Mail,
  FileText,
  Zap,
} from 'lucide-react';

const BLOCK_ICONS: Record<string, React.ElementType> = {
  task: ListChecks,
  action: Zap,
  navigation: Globe,
  extraction: FileText,
  for_loop: Repeat,
  conditional: GitBranch,
  code: Code,
  text_prompt: Brain,
  send_email: Mail,
  wait: Clock,
};

const BLOCK_COLORS: Record<string, string> = {
  task: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  action: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  navigation: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  extraction: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  for_loop: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  conditional: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  code: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  text_prompt: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  send_email: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  wait: 'bg-muted text-muted-foreground border-muted',
};

interface TimelineBlockProps {
  entry: TimelineEntry;
  depth?: number;
}

export function TimelineBlockItem({ entry, depth = 0 }: TimelineBlockProps) {
  const [expanded, setExpanded] = useState(depth < 1);
  const block = entry.block;
  const thought = entry.thought;

  // ── Thought card ──────────────────────────────────────────────────────────
  if (entry.type === 'thought' && thought) {
    return (
      <div className="flex gap-3 rounded-lg border bg-card px-4 py-3">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-pink-500/10">
          <Brain className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">Thought</p>
          <p className="mt-0.5 text-sm">{thought.thought}</p>
          {thought.answer && (
            <div className="mt-2 rounded-md bg-muted/50 px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">Decision</p>
              <p className="mt-0.5 text-sm">{thought.answer}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!block) return null;

  // ── Block card ────────────────────────────────────────────────────────────
  const hasChildren = entry.children && entry.children.length > 0;
  const hasActions = block.actions && block.actions.length > 0;
  const hasContent = hasChildren || hasActions || block.output || block.failure_reason;
  const Icon = BLOCK_ICONS[block.block_type] || ListChecks;
  const colorClass = BLOCK_COLORS[block.block_type] || BLOCK_COLORS.task;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => hasContent && setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
          hasContent && 'hover:bg-muted/30 cursor-pointer',
          !hasContent && 'cursor-default',
        )}
      >
        {/* Expand/collapse icon */}
        <div className="w-4 shrink-0">
          {hasContent &&
            (expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ))}
        </div>

        {/* Block type badge */}
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium',
            colorClass,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {block.block_type.replace(/_/g, ' ')}
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          {block.label && (
            <span className="text-sm font-medium truncate block">{block.label}</span>
          )}
          {!block.label && block.navigation_goal && (
            <span className="text-xs text-muted-foreground truncate block">
              {block.navigation_goal}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 shrink-0">
          {hasActions && (
            <span className="text-xs text-muted-foreground">
              {block.actions.length} action{block.actions.length !== 1 ? 's' : ''}
            </span>
          )}
          {block.duration != null && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDuration(block.duration)}
            </span>
          )}
          {block.status && <StatusBadge status={block.status} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && hasContent && (
        <div className="border-t px-4 py-4 space-y-4">
          {/* URL */}
          {block.url && (
            <div className="flex items-center gap-2 text-xs">
              <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
              <a
                href={block.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {block.url}
              </a>
            </div>
          )}

          {/* Navigation goal */}
          {block.label && block.navigation_goal && (
            <p className="text-xs text-muted-foreground">{block.navigation_goal}</p>
          )}

          {/* Failure reason */}
          {block.failure_reason && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
              <p className="text-sm text-destructive">{block.failure_reason}</p>
            </div>
          )}

          {/* Actions */}
          {hasActions && (
            <div className="space-y-1.5">
              {block.actions.map((action, i) => (
                <ActionCard key={i} action={action} index={i} />
              ))}
            </div>
          )}

          {/* Output */}
          {block.output != null && block.output !== undefined && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Output</p>
              <div className="rounded-md border bg-muted/20 p-3">
                <JsonViewer data={block.output} />
              </div>
            </div>
          )}

          {/* Nested children */}
          {hasChildren && (
            <div className="space-y-2 pl-2 border-l-2 border-muted ml-2">
              {entry.children.map((child, i) => (
                <TimelineBlockItem key={i} entry={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
