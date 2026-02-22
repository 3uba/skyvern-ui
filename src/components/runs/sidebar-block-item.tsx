'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDuration } from '@/lib/utils/format-duration';
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
  MousePointerClick,
  Type,
  Download,
  Upload,
  Eye,
  CheckSquare,
  Timer,
  RotateCw,
  ArrowUpRight,
  GripHorizontal,
  Check,
  X,
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
  action:
    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  navigation:
    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  extraction:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  for_loop:
    'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  conditional:
    'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  code: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  text_prompt:
    'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  send_email:
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  wait: 'bg-muted text-muted-foreground border-muted',
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  click: MousePointerClick,
  input_text: Type,
  download_file: Download,
  upload_file: Upload,
  hover: Eye,
  select_option: CheckSquare,
  checkbox: CheckSquare,
  wait: Timer,
  reload_page: RotateCw,
  goto_url: ArrowUpRight,
  drag: GripHorizontal,
};

const READABLE_TYPES: Record<string, string> = {
  click: 'Click',
  input_text: 'Input',
  download_file: 'Download',
  upload_file: 'Upload',
  select_option: 'Select',
  checkbox: 'Checkbox',
  hover: 'Hover',
  wait: 'Wait',
  solve_captcha: 'Captcha',
  terminate: 'Terminate',
  complete: 'Complete',
  reload_page: 'Reload',
  goto_url: 'Navigate',
  scroll: 'Scroll',
  keypress: 'Keypress',
  null_action: 'No Action',
  extract: 'Extract',
  drag: 'Drag',
};

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
                READABLE_TYPES[action.action_type] || action.action_type;
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
