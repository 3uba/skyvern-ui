'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRun, useRunTimeline, useRunArtifacts } from '@/hooks/use-runs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/status-badge';
import { PageSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { JsonViewer } from '@/components/shared/json-viewer';
import { CopyButton } from '@/components/shared/copy-button';
import { formatDate } from '@/lib/utils/format-date';
import { formatDuration } from '@/lib/utils/format-duration';
import { ArrowLeft, Clock, Globe, Target, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Run } from '@/components/runs';

// Task runs return extra fields beyond the Run type
type TaskRun = Run & {
  url?: string;
  engine?: string;
  duration?: number;
  navigation_goal?: string;
  data_extraction_goal?: string;
  extracted_information?: unknown;
};

export default function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params);
  const { data, isLoading, error, refetch } = useRun(taskId);
  const { data: timeline } = useRunTimeline(taskId);
  const { data: artifacts } = useRunArtifacts(taskId);

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!data) return <ErrorState message="Task not found" />;

  const run = data as TaskRun;

  const screenshots = (artifacts ?? []).filter((a) => a.artifact_type === 'screenshot');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Task Detail</h1>
            <StatusBadge status={run.status || 'unknown'} />
          </div>
          <p className="text-sm text-muted-foreground font-mono">{taskId}</p>
        </div>
        <CopyButton value={taskId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">URL:</span>
                  <a
                    href={run.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate flex items-center gap-1"
                  >
                    {run.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{run.created_at ? formatDate(run.created_at) : '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Engine:</span>
                  <span>{run.engine || '-'}</span>
                </div>
                {run.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{formatDuration(run.duration)}</span>
                  </div>
                )}
              </div>

              {run.navigation_goal && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">Navigation Goal</p>
                    <p className="text-sm text-muted-foreground">{run.navigation_goal}</p>
                  </div>
                </>
              )}

              {run.data_extraction_goal && (
                <div>
                  <p className="text-sm font-medium mb-1">Extraction Goal</p>
                  <p className="text-sm text-muted-foreground">{run.data_extraction_goal}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="screenshots">
                Screenshots ({screenshots.length})
              </TabsTrigger>
              <TabsTrigger value="data">Extracted Data</TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {Array.isArray(timeline) && timeline.length > 0 ? (
                    <div className="space-y-4">
                      {timeline.map((entry, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {entry.block?.label || entry.block?.block_type || entry.type || 'Event'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.created_at ? formatDate(entry.created_at) : ''}
                            </p>
                            {entry.block?.navigation_goal && (
                              <p className="text-sm text-muted-foreground mt-1">{entry.block.navigation_goal}</p>
                            )}
                          </div>
                          {entry.block?.status && <StatusBadge status={entry.block.status} />}
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
            </TabsContent>

            <TabsContent value="screenshots" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {screenshots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {screenshots.map((ss, i) => (
                        <div key={i} className="rounded-md border overflow-hidden">
                          <img
                            src={ss.signed_url || ss.uri}
                            alt={`Screenshot ${i + 1}`}
                            className="w-full h-auto"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No screenshots available
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {run.extracted_information ? (
                    <JsonViewer data={run.extracted_information} />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No extracted data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="raw" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <JsonViewer data={run} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={run.status || 'unknown'} />
              {run.failure_reason && (
                <p className="text-xs text-destructive mt-2">{run.failure_reason}</p>
              )}
            </CardContent>
          </Card>

          {run.output != null && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Output</CardTitle>
              </CardHeader>
              <CardContent>
                <JsonViewer data={run.output} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
