'use client';

import { useState, useMemo } from 'react';
import { useRunWorkflow } from '@/hooks/use-workflows';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Play, Loader2 } from 'lucide-react';

interface RunWorkflowDialogProps {
  workflowId: string;
  workflowTitle?: string;
  parameters?: Record<string, unknown>[];
  trigger?: React.ReactNode;
  onSuccess?: (runId: string) => void;
}

export function RunWorkflowDialog({
  workflowId,
  workflowTitle,
  parameters = [],
  trigger,
  onSuccess,
}: RunWorkflowDialogProps) {
  const [open, setOpen] = useState(false);
  const runWorkflow = useRunWorkflow();

  const workflowParams = useMemo(
    () => parameters.filter((p) => (p.parameter_type as string) === 'workflow'),
    [parameters],
  );

  const [values, setValues] = useState<Record<string, string>>({});

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Pre-fill defaults
      const defaults: Record<string, string> = {};
      for (const p of workflowParams) {
        const key = p.key as string;
        const def = p.default_value;
        if (key && def != null) defaults[key] = String(def);
      }
      setValues(defaults);
    }
  };

  const handleRun = async () => {
    try {
      const params: Record<string, unknown> = {};
      for (const p of workflowParams) {
        const key = p.key as string;
        if (values[key] !== undefined && values[key] !== '') {
          params[key] = values[key];
        }
      }

      const data: Record<string, unknown> = {};
      if (Object.keys(params).length > 0) data.parameters = params;

      const result = await runWorkflow.mutateAsync({ workflowId, data });
      const runId = result?.workflow_run_id || result?.run_id;
      toast.success(runId ? `Run started: ${runId.slice(0, 16)}...` : 'Workflow run started');
      setOpen(false);
      onSuccess?.(runId);
    } catch {
      toast.error('Failed to run workflow');
    }
  };

  // If no parameters, just run directly without dialog
  const handleDirectRun = async () => {
    if (workflowParams.length > 0) {
      setOpen(true);
      return;
    }
    try {
      const result = await runWorkflow.mutateAsync({ workflowId });
      const runId = result?.workflow_run_id || result?.run_id;
      toast.success(runId ? `Run started: ${runId.slice(0, 16)}...` : 'Workflow run started');
      onSuccess?.(runId);
    } catch {
      toast.error('Failed to run workflow');
    }
  };

  const defaultTrigger = (
    <Button size="sm" disabled={runWorkflow.isPending} onClick={workflowParams.length === 0 ? handleDirectRun : undefined}>
      {runWorkflow.isPending ? (
        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
      ) : (
        <Play className="mr-1.5 h-3.5 w-3.5" />
      )}
      Run
    </Button>
  );

  if (workflowParams.length === 0) {
    return trigger ? (
      <span onClick={handleDirectRun}>{trigger}</span>
    ) : (
      defaultTrigger
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Run {workflowTitle || 'Workflow'}</DialogTitle>
          <DialogDescription>
            Set parameter values before running. Leave blank to use defaults.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
          {workflowParams.map((p) => {
            const key = p.key as string;
            const desc = p.description as string | undefined;
            const defaultVal = p.default_value;
            const value = values[key] ?? '';
            const isLong = (defaultVal && String(defaultVal).length > 60) || desc?.includes('JSON');

            return (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={`param-${key}`} className="text-sm font-medium">
                  {key}
                </Label>
                {desc && (
                  <p className="text-xs text-muted-foreground">{desc}</p>
                )}
                {isLong ? (
                  <Textarea
                    id={`param-${key}`}
                    value={value}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    placeholder={defaultVal != null ? String(defaultVal) : ''}
                    rows={3}
                    className="font-mono text-sm"
                  />
                ) : (
                  <Input
                    id={`param-${key}`}
                    value={value}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    placeholder={defaultVal != null ? String(defaultVal) : ''}
                  />
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRun} disabled={runWorkflow.isPending}>
            {runWorkflow.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
