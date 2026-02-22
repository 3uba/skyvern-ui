'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWorkflows } from '@/hooks/use-workflows';
import { useCreateTask } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/format-date';
import { toast } from 'sonner';
import { Play, Loader2, Plus, History, ArrowRight } from 'lucide-react';

export default function TasksPage() {
  const router = useRouter();
  const createTask = useCreateTask();
  const { data } = useWorkflows(1, 50);
  const [prompt, setPrompt] = useState('');

  const savedTasks = Array.isArray(data)
    ? data.filter((w: Record<string, unknown>) => w.is_saved_task)
    : [];

  const canSubmit = prompt.trim().length > 0 && !createTask.isPending;

  const handleQuickRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      const result = await createTask.mutateAsync({
        prompt: prompt.trim(),
        engine: 'skyvern-2.0',
      });
      toast.success('Task started');
      router.push(`/runs/${result.run_id || result.task_id}`);
    } catch {
      toast.error('Failed to create task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">One-time browser automation tasks</p>
        </div>
        <Button asChild>
          <Link href="/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      {/* Quick prompt box */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleQuickRun} className="flex gap-3">
            <Textarea
              placeholder="What would you like to accomplish? e.g. Go to amazon.com and find the cheapest wireless keyboard"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="flex-1 resize-none"
            />
            <Button type="submit" disabled={!canSubmit} className="self-end shrink-0">
              {createTask.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run
            </Button>
          </form>
          <div className="flex justify-end mt-2">
            <Link href="/tasks/new" className="text-xs text-muted-foreground hover:text-foreground">
              Advanced options <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Saved tasks */}
      {savedTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Saved Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedTasks.map((task: Record<string, unknown>) => {
              const wpid = (task.workflow_permanent_id || task.workflow_id) as string;
              return (
                <Card key={wpid} className="group hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {(task.title as string) || 'Untitled Task'}
                    </CardTitle>
                    {typeof task.description === 'string' && task.description && (
                      <CardDescription className="line-clamp-2">
                        {task.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        v{task.version as number}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {task.created_at ? formatDate(task.created_at as string) : ''}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/workflows/${wpid}/runs`}>
                          <History className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/workflows/${wpid}/build`}>
                          <Play className="mr-1 h-3.5 w-3.5" />
                          Run
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
