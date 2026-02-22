'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRuns } from '@/hooks/use-runs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { CopyButton } from '@/components/shared/copy-button';
import { formatDate } from '@/lib/utils/format-date';
import { History, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function RunsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const pageSize = 15;
  const { data, isLoading, error, refetch } = useRuns(page, pageSize, searchKey || undefined);

  const runs = Array.isArray(data) ? data : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKey(searchInput.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchKey('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Runs</h1>
          <p className="text-muted-foreground">Task and workflow run history</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by run ID, parameter, or value..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Search
        </Button>
      </form>

      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : runs.length === 0 ? (
        <EmptyState
          icon={<History className="h-12 w-12" />}
          title={searchKey ? 'No runs found' : 'No runs yet'}
          description={searchKey ? `No results for "${searchKey}"` : 'Run a task or workflow to see execution history here'}
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run ID</TableHead>
                  <TableHead>Workflow</TableHead>
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
                            href={`/runs/${runId}`}
                            className="text-primary hover:underline"
                          >
                            {runId?.slice(0, 16)}...
                          </Link>
                          <CopyButton value={runId} />
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {run.workflow_title || '-'}
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
              disabled={runs.length < pageSize}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
