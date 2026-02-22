'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getBlockConfig } from './block-config';
import { BlockFieldSection } from './block-field-sections';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ChevronRight,
  MoreHorizontal,
  Copy,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react';

interface BlockCardProps {
  block: Record<string, unknown>;
  index: number;
  total: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (updated: Record<string, unknown>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function getBlockSummary(block: Record<string, unknown>): string {
  const blockType = (block.block_type || '') as string;
  const url = block.url as string | undefined;
  const prompt = block.prompt as string | undefined;
  const goal = (block.navigation_goal || block.data_extraction_goal) as string | undefined;
  const code = block.code as string | undefined;
  const loopKey = block.loop_over_parameter_key as string | undefined;
  const waitSec = block.wait_sec as number | undefined;
  const method = block.method as string | undefined;

  if (blockType === 'http_request' && method && url) return `${method} ${url}`;
  if (blockType === 'wait' && waitSec) return `${waitSec} seconds`;
  if (blockType === 'for_loop' && loopKey) return `over {{ ${loopKey} }}`;
  if (url) return url;
  if (prompt) return prompt.slice(0, 100);
  if (goal) return goal.slice(0, 100);
  if (code) return code.split('\n')[0].slice(0, 80);
  return '';
}

export function BlockCard({
  block,
  index,
  total,
  expanded,
  onToggle,
  onChange,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: BlockCardProps) {
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...block });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setDraft({ ...block });
  }, [block]);

  const blockType = (draft.block_type || 'task') as string;
  const config = getBlockConfig(blockType);
  const Icon = config.icon;
  const label = (draft.label || '') as string;
  const displayLabel = label.replace(/_/g, ' ') || config.displayName;
  const summary = getBlockSummary(draft);

  const update = useCallback(
    (key: string, value: unknown) => {
      setDraft((prev) => {
        const next = { ...prev, [key]: value };
        onChange(next);
        return next;
      });
    },
    [onChange],
  );

  return (
    <>
      <Collapsible open={expanded} onOpenChange={onToggle}>
        <div
          className={cn(
            'rounded-lg border bg-card overflow-hidden transition-shadow',
            expanded ? 'shadow-md ring-1 ring-border' : 'shadow-sm hover:shadow-md',
          )}
        >
          {/* Header row */}
          <div className="flex items-stretch">
            {/* Left accent bar */}
            <div className={cn('w-1 shrink-0 rounded-l-lg', config.accent)} />

            {/* Clickable header content */}
            <CollapsibleTrigger asChild>
              <button className="flex-1 flex items-center gap-3 px-3 py-3 text-left cursor-pointer hover:bg-accent/30 transition-colors min-w-0">
                {/* Step number */}
                <span className="text-[11px] font-mono font-medium text-muted-foreground/60 w-4 text-center shrink-0">
                  {index + 1}
                </span>

                {/* Icon */}
                <div className={cn('p-1.5 rounded-md shrink-0', config.bg)}>
                  <Icon className={cn('h-4 w-4', config.color)} />
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium truncate">
                      {displayLabel}
                    </span>
                    <span className={cn('text-[10px] font-medium uppercase tracking-wider shrink-0', config.color)}>
                      {config.displayName}
                    </span>
                  </div>
                  {!expanded && summary && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{summary}</p>
                  )}
                </div>

                {/* Chevron */}
                <ChevronRight
                  className={cn(
                    'h-4 w-4 text-muted-foreground/40 transition-transform shrink-0',
                    expanded && 'rotate-90',
                  )}
                />
              </button>
            </CollapsibleTrigger>

            {/* Actions menu — separate from the trigger so clicks don't toggle */}
            <div className="pr-2 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onMoveUp} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                    Move Up
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onMoveDown} disabled={index === total - 1}>
                    <ArrowDown className="h-4 w-4" />
                    Move Down
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Expanded content */}
          <CollapsibleContent>
            <div className="flex items-stretch">
              <div className={cn('w-1 shrink-0', config.accent)} />
              <div className="flex-1 border-t bg-muted/30 px-5 py-5">
                <BlockFieldSection blockType={blockType} draft={draft} update={update} />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete block?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &ldquo;{displayLabel}&rdquo; from the workflow.
              You can undo by closing without saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false);
                onDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
