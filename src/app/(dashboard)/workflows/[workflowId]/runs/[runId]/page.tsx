'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRun, useRunTimeline } from '@/hooks/use-runs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { PageSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { JsonViewer } from '@/components/shared/json-viewer';
import { formatDate } from '@/lib/utils/format-date';
import { ArrowLeft } from 'lucide-react';

export default function WorkflowRunDetailPage({
  params,
}: {
  params: Promise<{ workflowId: string; runId: string }>;
}) {
  const { workflowId, runId } = use(params);
  const { data: run, isLoading, error, refetch } = useRun(runId);
  const { data: timeline } = useRunTimeline(runId);

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/workflows/${workflowId}/runs`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Run Detail</h1>
            {run?.status && <StatusBadge status={run.status} />}
          </div>
          <p className="text-sm text-muted-foreground font-mono">{runId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(timeline) && timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.map((entry: Record<string, string>, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{entry.type || 'Event'}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.created_at ? formatDate(entry.created_at) : ''}
                      </p>
                    </div>
                    {entry.status && <StatusBadge status={entry.status} />}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No timeline data available
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Raw Data</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonViewer data={run} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
