'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api/fetch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { formatRelativeDate } from '@/lib/utils/format-date';
import { ListChecks, Workflow, Plus, Activity, CheckCircle2, KeyRound } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const {
    data: workflows,
    isLoading: wfLoading,
    error: wfError,
  } = useQuery({
    queryKey: ['dashboard', 'workflows'],
    queryFn: () => fetchApi('workflows?page_size=5'),
  });

  const {
    data: sessions,
    isLoading: sessLoading,
  } = useQuery({
    queryKey: ['dashboard', 'sessions'],
    queryFn: () => fetchApi('browser_sessions'),
  });

  const {
    data: credentials,
    isLoading: credLoading,
  } = useQuery({
    queryKey: ['dashboard', 'credentials'],
    queryFn: () => fetchApi('credentials'),
  });

  const {
    data: runs,
    isLoading: runsLoading,
  } = useQuery({
    queryKey: ['dashboard', 'runs'],
    queryFn: () => fetchApi('runs?page=1&page_size=5'),
  });

  const isLoading = wfLoading || sessLoading || credLoading || runsLoading;

  if (wfError) {
    return <ErrorState message={wfError.message} />;
  }

  const workflowCount = Array.isArray(workflows) ? workflows.length : 0;
  const activeSessions = Array.isArray(sessions) ? sessions.length : 0;
  const credentialCount = Array.isArray(credentials) ? credentials.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your browser automation</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/tasks">
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Workflows" value={workflowCount} icon={Workflow} description="Total workflows" />
          <StatCard title="Active Sessions" value={activeSessions} icon={Activity} description="Currently running" />
          <StatCard title="Credentials" value={credentialCount} icon={KeyRound} description="Stored credentials" />
          <StatCard title="System" value="Ready" icon={CheckCircle2} description="Operational" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Workflows</CardTitle>
            <CardDescription>Your latest workflow configurations</CardDescription>
          </CardHeader>
          <CardContent>
            {Array.isArray(workflows) && workflows.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflows.slice(0, 5).map((wf: Record<string, string>) => (
                    <TableRow key={wf.workflow_permanent_id || wf.workflow_id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/workflows/${wf.workflow_permanent_id || wf.workflow_id}/build`}
                          className="hover:underline"
                        >
                          {wf.title || wf.workflow_permanent_id || 'Untitled'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={wf.status || 'active'} />
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {wf.created_at ? formatRelativeDate(wf.created_at) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No workflows yet.{' '}
                <Link href="/workflows" className="text-primary hover:underline">
                  Create one
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Runs</CardTitle>
            <CardDescription>Latest task and workflow executions</CardDescription>
          </CardHeader>
          <CardContent>
            {Array.isArray(runs) && runs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.slice(0, 5).map((run: Record<string, string>) => {
                    const runId = run.workflow_run_id || run.task_id;
                    return (
                      <TableRow key={runId}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/runs/${runId}`}
                            className="hover:underline"
                          >
                            {run.workflow_title || runId?.slice(0, 16) || 'Untitled'}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={run.status || 'unknown'} />
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {run.started_at ? formatRelativeDate(run.started_at) : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No runs yet.{' '}
                <Link href="/tasks" className="text-primary hover:underline">
                  Run a task
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
