'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useWorkflow } from '@/hooks/use-workflows';
import { RunWorkflowDialog } from '@/components/workflow/run-workflow-dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { CopyButton } from '@/components/shared/copy-button';
import { EmptyState } from '@/components/shared/empty-state';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { formatDate } from '@/lib/utils/format-date';
import { ArrowLeft, History, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

async function fetchApi(path: string) {
  const res = await fetch(`/api/skyvern/${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export default function WorkflowRunsPage({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const { workflowId } = use(params);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const { data: workflow } = useWorkflow(workflowId);
  // Fetch all runs and filter client-side (API has no per-workflow filter)
  const { data: allRuns, isLoading, error, refetch } = useQuery({
    queryKey: ['workflow-runs', workflowId, page],
    queryFn: () => fetchApi(`runs?page=${page}&page_size=100`),
  });

  const runs = useMemo(() => {
    if (!Array.isArray(allRuns)) return [];
    return allRuns.filter(
      (r: Record<string, string>) => r.workflow_permanent_id === workflowId,
    );
  }, [allRuns, workflowId]);

  const wf = workflow as Record<string, unknown> | undefined;
  const defn = wf?.workflow_definition as Record<string, unknown> | undefined;
  const allParams = Array.isArray(defn?.parameters) ? (defn.parameters as Record<string, unknown>[]) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/workflows/${workflowId}/build`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {(wf?.title as string) || 'Workflow'} — Runs
          </h1>
          <p className="text-sm text-muted-foreground font-mono">{workflowId}</p>
        </div>
        <RunWorkflowDialog
          workflowId={workflowId}
          workflowTitle={wf?.title as string}
          parameters={allParams}
          onSuccess={() => refetch()}
        />
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : runs.length === 0 ? (
        <EmptyState
          icon={<History className="h-12 w-12" />}
          title="No runs yet"
          description="Run this workflow to see execution history"
          action={
            <RunWorkflowDialog
              workflowId={workflowId}
              workflowTitle={wf?.title as string}
              parameters={allParams}
              onSuccess={() => refetch()}
            />
          }
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead className="text-right">Finished</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run: Record<string, string>) => {
                  const runId = run.workflow_run_id || run.task_id;
                  return (
                    <TableRow key={runId}>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/workflows/${workflowId}/runs/${runId}`}
                            className="text-primary hover:underline"
                          >
                            {runId?.slice(0, 20)}...
                          </Link>
                          <CopyButton value={runId} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={run.status || 'unknown'} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {run.started_at ? formatDate(run.started_at) : '-'}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {run.finished_at ? formatDate(run.finished_at) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {runs.length} run{runs.length !== 1 ? 's' : ''} found
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={Array.isArray(allRuns) && allRuns.length < 100}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
