'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useWorkflows } from '@/hooks/use-workflows';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { formatDate } from '@/lib/utils/format-date';
import { Workflow, Play, Pencil, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function WorkflowsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 50;
  const { data, isLoading, error, refetch } = useWorkflows(page, pageSize);
  const allWorkflows = Array.isArray(data) ? data : [];

  const workflows = useMemo(() => {
    if (!search.trim()) return allWorkflows;
    const q = search.toLowerCase();
    return allWorkflows.filter((wf: Record<string, unknown>) => {
      const title = ((wf.title as string) || '').toLowerCase();
      const desc = ((wf.description as string) || '').toLowerCase();
      const wpid = ((wf.workflow_permanent_id as string) || '').toLowerCase();
      return title.includes(q) || desc.includes(q) || wpid.includes(q);
    });
  }, [allWorkflows, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">Reusable automation workflows</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter workflows by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : workflows.length === 0 ? (
        <EmptyState
          icon={<Workflow className="h-12 w-12" />}
          title={search ? 'No workflows found' : 'No workflows yet'}
          description={search ? `No results for "${search}"` : 'Create your first reusable automation workflow'}
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Blocks</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((wf: Record<string, unknown>) => {
                  const wpid = (wf.workflow_permanent_id || wf.workflow_id) as string;
                  const defn = wf.workflow_definition as Record<string, unknown> | undefined;
                  const blockCount = Array.isArray(defn?.blocks) ? defn.blocks.length : 0;
                  return (
                    <TableRow key={wpid}>
                      <TableCell className="font-medium max-w-[220px]">
                        <Link
                          href={`/workflows/${wpid}/build`}
                          className="text-primary hover:underline"
                        >
                          {(wf.title as string) || 'Untitled Workflow'}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {(wf.description as string) || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {blockCount} {blockCount === 1 ? 'block' : 'blocks'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        v{wf.version as number}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {wf.created_at ? formatDate(wf.created_at as string) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                  <Link href={`/workflows/${wpid}/build`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                  <Link href={`/workflows/${wpid}/runs`}>
                                    <Play className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Runs</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {!search && (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={allWorkflows.length < pageSize}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
