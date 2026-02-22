'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useWorkflows, useRunWorkflow } from '@/hooks/use-workflows';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { getBlockConfig } from '@/components/workflow/block-config';
import { Sparkles, Play, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export default function DiscoverPage() {
  const { data, isLoading, error, refetch } = useWorkflows(1, 100);
  const runWorkflow = useRunWorkflow();

  const templates = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter((w: Record<string, unknown>) => w.is_template);
  }, [data]);

  const handleRun = async (workflowId: string) => {
    try {
      const result = await runWorkflow.mutateAsync({ workflowId });
      const runId = result?.workflow_run_id;
      toast.success(runId ? `Run started: ${runId.slice(0, 16)}...` : 'Template run started');
    } catch {
      toast.error('Failed to run template');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
        <p className="text-muted-foreground">Browse workflow templates and get started quickly</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : templates.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-12 w-12" />}
          title="No templates yet"
          description="Mark a workflow as a template to share it here. Templates are reusable workflow configurations that anyone on your team can run."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((wf: Record<string, unknown>) => {
            const wpid = (wf.workflow_permanent_id || wf.workflow_id) as string;
            const defn = wf.workflow_definition as Record<string, unknown> | undefined;
            const blocks = Array.isArray(defn?.blocks) ? (defn.blocks as Record<string, unknown>[]) : [];
            const blockTypes = [...new Set(blocks.map((b) => b.block_type as string))];

            return (
              <Card key={wpid} className="group flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base leading-tight">
                      {(wf.title as string) || 'Untitled'}
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">
                      {blocks.length} blocks
                    </Badge>
                  </div>
                  {typeof wf.description === 'string' && wf.description && (
                    <CardDescription className="line-clamp-2 text-xs">
                      {wf.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-3">
                  <div className="flex flex-wrap gap-1">
                    {blockTypes.slice(0, 5).map((bt) => {
                      const config = getBlockConfig(bt);
                      const Icon = config.icon;
                      return (
                        <Badge key={bt} variant="outline" className="text-[10px] gap-1 py-0.5">
                          <Icon className="h-3 w-3" />
                          {config.displayName}
                        </Badge>
                      );
                    })}
                    {blockTypes.length > 5 && (
                      <Badge variant="outline" className="text-[10px] py-0.5">
                        +{blockTypes.length - 5} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/workflows/${wpid}/build`}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRun(wpid)}
                      disabled={runWorkflow.isPending}
                    >
                      <Play className="mr-1.5 h-3.5 w-3.5" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
