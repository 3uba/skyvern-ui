'use client';

import { use, useCallback, useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useWorkflow, useUpdateWorkflow } from '@/hooks/use-workflows';
import { RunWorkflowDialog } from '@/components/workflow/run-workflow-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { ParametersPanel } from '@/components/workflow/parameters-panel';
import { WorkflowBuilder } from '@/components/workflow/workflow-builder';
import { ArrowLeft, Save, History, Variable, Loader2, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowBuilderPage({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const { workflowId } = use(params);
  const { data: workflow, isLoading, error, refetch } = useWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflow();

  const [localBlocks, setLocalBlocks] = useState<Record<string, unknown>[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showParams, setShowParams] = useState(false);

  const wf = workflow as Record<string, unknown> | undefined;
  const defn = wf?.workflow_definition as Record<string, unknown> | undefined;
  const originalBlocks = useMemo(
    () => (Array.isArray(defn?.blocks) ? (defn.blocks as Record<string, unknown>[]) : []),
    [defn],
  );
  const allParams = useMemo(
    () => (Array.isArray(defn?.parameters) ? (defn.parameters as Record<string, unknown>[]) : []),
    [defn],
  );

  // Init local blocks from API
  useEffect(() => {
    if (originalBlocks.length > 0 && localBlocks.length === 0) {
      setLocalBlocks(originalBlocks.map((b) => ({ ...b })));
    }
  }, [originalBlocks, localBlocks.length]);

  const handleBlocksChange = useCallback(
    (blocks: Record<string, unknown>[]) => {
      setLocalBlocks(blocks);
      setHasChanges(true);
    },
    [],
  );

  const handleSave = async () => {
    if (!wf) return;
    try {
      const updatedDefinition = {
        ...defn,
        blocks: localBlocks,
      };
      await updateWorkflow.mutateAsync({
        workflowId,
        data: {
          json_definition: {
            title: wf.title,
            description: wf.description,
            workflow_definition: updatedDefinition,
          },
        },
      });
      setHasChanges(false);
      toast.success('Workflow saved');
    } catch {
      toast.error('Failed to save workflow');
    }
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const blocks = localBlocks.length > 0 ? localBlocks : originalBlocks;
  const blockCount = blocks.length;
  const workflowParams = allParams.filter(
    (p) => (p.parameter_type as string) === 'workflow',
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b bg-card shrink-0">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/workflows">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">
            {(wf?.title as string) || 'Workflow'}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-[10px]">v{wf?.version as number}</Badge>
            <Badge variant="outline" className="text-[10px]">{blockCount} blocks</Badge>
            {workflowParams.length > 0 && (
              <Badge variant="outline" className="text-[10px]">{workflowParams.length} params</Badge>
            )}
            {hasChanges && (
              <Badge variant="default" className="text-[10px] bg-amber-500">Unsaved</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {workflowParams.length > 0 && (
            <Button
              variant={showParams ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowParams(!showParams)}
            >
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Params ({workflowParams.length})
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/workflows/${workflowId}/runs`}>
              <History className="mr-1.5 h-3.5 w-3.5" />
              Runs
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || updateWorkflow.isPending}
          >
            {updateWorkflow.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-3.5 w-3.5" />
            )}
            Save
          </Button>
          <RunWorkflowDialog
            workflowId={workflowId}
            workflowTitle={wf?.title as string}
            parameters={allParams}
          />
        </div>
      </div>

      {typeof wf?.description === 'string' && wf.description && (
        <div className="px-4 py-2 border-b bg-muted/30 text-sm text-muted-foreground shrink-0">
          {wf.description}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Workflow builder */}
        <div className="flex-1">
          <WorkflowBuilder
            blocks={blocks}
            onBlocksChange={handleBlocksChange}
          />
        </div>

        {/* Parameters sidebar */}
        {showParams && (
          <div className="w-[280px] border-l bg-card flex flex-col">
            <div className="px-3 py-3 border-b">
              <h2 className="text-sm font-medium flex items-center gap-1.5">
                <Variable className="h-3.5 w-3.5" />
                Parameters ({workflowParams.length})
              </h2>
            </div>
            <div className="flex-1 overflow-auto">
              <ParametersPanel parameters={allParams} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
