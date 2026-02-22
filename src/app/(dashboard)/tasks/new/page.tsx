'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTask } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ChevronDown, Play } from 'lucide-react';
import Link from 'next/link';

export default function NewTaskPage() {
  const router = useRouter();
  const createTask = useCreateTask();
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');
  const [engine, setEngine] = useState('skyvern-2.0');
  const [proxyLocation, setProxyLocation] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      if (proxyLocation && proxyLocation !== 'NONE') payload.proxy_location = proxyLocation;

      const result = await createTask.mutateAsync(payload);
      toast.success('Task started');
      router.push(`/runs/${result.run_id || result.task_id}`);
    } catch {
      toast.error('Failed to create task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Task</h1>
          <p className="text-muted-foreground">Describe what you want the browser to do</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="What would you like to accomplish? e.g. Go to amazon.com and find the cheapest wireless keyboard under $30"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="text-base"
            autoFocus
          />
        </div>

        <div className="space-y-2">
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

        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" type="button" className="gap-1 text-muted-foreground">
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
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
                    <SelectItem value="skyvern-2.0">Skyvern 2.0 (Recommended)</SelectItem>
                    <SelectItem value="skyvern-1.0">Skyvern 1.0</SelectItem>
                    <SelectItem value="openai-cua">OpenAI CUA</SelectItem>
                    <SelectItem value="anthropic-cua">Anthropic CUA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Proxy Location</Label>
                <Select value={proxyLocation} onValueChange={setProxyLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="RESIDENTIAL">US (Residential)</SelectItem>
                    <SelectItem value="RESIDENTIAL_GB">United Kingdom</SelectItem>
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

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!canSubmit} size="lg">
            {createTask.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run Task
          </Button>
        </div>
      </form>
    </div>
  );
}
