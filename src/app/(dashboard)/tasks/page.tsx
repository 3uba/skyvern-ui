'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWorkflows } from '@/hooks/use-workflows';
import { useCreateTask } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatDate } from '@/lib/utils/format-date';
import { toast } from 'sonner';
import {
  Play,
  Loader2,
  ChevronDown,
  History,
  Bookmark,
} from 'lucide-react';

export default function TasksPage() {
  const router = useRouter();
  const createTask = useCreateTask();
  const { data } = useWorkflows(1, 50);
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');
  const [engine, setEngine] = useState('skyvern-2.0');
  const [proxyLocation, setProxyLocation] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const savedTasks = Array.isArray(data)
    ? data.filter((w: Record<string, unknown>) => w.is_saved_task)
    : [];

  const canSubmit = prompt.trim().length > 0 && !createTask.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      const payload: Record<string, unknown> = {
        prompt: prompt.trim(),
        engine,
      };
      if (url.trim()) payload.url = url.trim();
      if (proxyLocation && proxyLocation !== 'NONE')
        payload.proxy_location = proxyLocation;

      const result = (await createTask.mutateAsync(payload)) as Record<string, string>;
      toast.success('Task started');
      router.push(`/runs/${result.run_id || result.task_id}`);
    } catch {
      toast.error('Failed to create task');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Run a Task</h1>
        <p className="text-muted-foreground">
          Describe what you want the browser to do and Skyvern will handle it.
        </p>
      </div>

      {/* ── Prompt form ────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <div className="space-y-2">
          <Textarea
            placeholder="What would you like to accomplish? e.g. Go to amazon.com and find the cheapest wireless keyboard under $30"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="text-base"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="url" className="text-sm text-muted-foreground">
            Starting URL (optional — Skyvern will figure it out if omitted)
          </Label>
          <Input
            id="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="gap-1 text-muted-foreground"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                />
                Advanced options
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Engine</Label>
                  <Select value={engine} onValueChange={setEngine}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skyvern-2.0">
                        Skyvern 2.0 (Recommended)
                      </SelectItem>
                      <SelectItem value="skyvern-1.0">Skyvern 1.0</SelectItem>
                      <SelectItem value="openai-cua">OpenAI CUA</SelectItem>
                      <SelectItem value="anthropic-cua">
                        Anthropic CUA
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Proxy Location</Label>
                  <Select
                    value={proxyLocation}
                    onValueChange={setProxyLocation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      <SelectItem value="RESIDENTIAL">
                        US (Residential)
                      </SelectItem>
                      <SelectItem value="RESIDENTIAL_GB">
                        United Kingdom
                      </SelectItem>
                      <SelectItem value="RESIDENTIAL_DE">Germany</SelectItem>
                      <SelectItem value="RESIDENTIAL_FR">France</SelectItem>
                      <SelectItem value="RESIDENTIAL_JP">Japan</SelectItem>
                      <SelectItem value="RESIDENTIAL_IN">India</SelectItem>
                      <SelectItem value="RESIDENTIAL_BR">Brazil</SelectItem>
                      <SelectItem value="RESIDENTIAL_AU">Australia</SelectItem>
                      <SelectItem value="RESIDENTIAL_CA">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Button type="submit" disabled={!canSubmit}>
            {createTask.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run Task
          </Button>
        </div>
      </form>

      {/* ── Saved tasks ────────────────────────────────────────────────────── */}
      {savedTasks.length > 0 && (
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">
              Saved Tasks
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedTasks.map((task: Record<string, unknown>) => {
              const wpid = (task.workflow_permanent_id ||
                task.workflow_id) as string;
              return (
                <Card
                  key={wpid}
                  className="group hover:border-primary/50 transition-colors"
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm">
                      {(task.title as string) || 'Untitled Task'}
                    </CardTitle>
                    {typeof task.description === 'string' &&
                      task.description && (
                        <CardDescription className="line-clamp-1 text-xs">
                          {task.description}
                        </CardDescription>
                      )}
                  </CardHeader>
                  <CardContent className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        v{task.version as number}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {task.created_at
                          ? formatDate(task.created_at as string)
                          : ''}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link href={`/workflows/${wpid}/runs`}>
                          <History className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button size="sm" className="h-7 text-xs" asChild>
                        <Link href={`/workflows/${wpid}/build`}>
                          <Play className="mr-1 h-3 w-3" />
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
