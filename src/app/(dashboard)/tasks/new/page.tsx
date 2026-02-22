'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTask } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const taskSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  navigation_goal: z.string().optional(),
  data_extraction_goal: z.string().optional(),
  navigation_payload: z.string().optional(),
  engine: z.string().optional(),
  max_steps_override: z.number().min(1).max(100).optional(),
  proxy_location: z.string().optional(),
});

type TaskValues = z.infer<typeof taskSchema>;

export default function NewTaskPage() {
  const router = useRouter();
  const createTask = useCreateTask();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      engine: 'v2',
    },
  });

  const onSubmit = async (values: TaskValues) => {
    try {
      const payload: Record<string, unknown> = {
        url: values.url,
      };
      if (values.navigation_goal) payload.navigation_goal = values.navigation_goal;
      if (values.data_extraction_goal) payload.data_extraction_goal = values.data_extraction_goal;
      if (values.navigation_payload) {
        try {
          payload.navigation_payload = JSON.parse(values.navigation_payload);
        } catch {
          payload.navigation_payload = values.navigation_payload;
        }
      }
      if (values.engine) payload.engine = values.engine;
      if (values.max_steps_override) payload.max_steps_override = values.max_steps_override;
      if (values.proxy_location) payload.proxy_location = values.proxy_location;

      const result = await createTask.mutateAsync(payload);
      toast.success('Task created successfully');
      router.push(`/tasks/${result.run_id || result.task_id}`);
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
          <p className="text-muted-foreground">Run a one-time browser automation task</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Configuration</CardTitle>
            <CardDescription>Configure the browser automation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Target URL *</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                {...register('url')}
              />
              {errors.url && (
                <p className="text-xs text-destructive">{errors.url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="navigation_goal">Navigation Goal</Label>
              <Textarea
                id="navigation_goal"
                placeholder="Describe what the browser should do..."
                rows={3}
                {...register('navigation_goal')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_extraction_goal">Data Extraction Goal</Label>
              <Textarea
                id="data_extraction_goal"
                placeholder="Describe what data to extract..."
                rows={3}
                {...register('data_extraction_goal')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="navigation_payload">Navigation Payload (JSON)</Label>
              <Textarea
                id="navigation_payload"
                placeholder='{"key": "value"}'
                rows={3}
                className="font-mono text-sm"
                {...register('navigation_payload')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Engine</Label>
                <Select defaultValue="v2" onValueChange={(v) => setValue('engine', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v2">V2 (Recommended)</SelectItem>
                    <SelectItem value="v1">V1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_steps">Max Steps</Label>
                <Input
                  id="max_steps"
                  type="number"
                  placeholder="25"
                  {...register('max_steps_override')}
                />
              </div>

              <div className="space-y-2">
                <Label>Proxy Location</Label>
                <Select onValueChange={(v) => setValue('proxy_location', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="US">US</SelectItem>
                    <SelectItem value="UK">UK</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="JP">Japan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href="/tasks">Cancel</Link>
          </Button>
          <Button type="submit" disabled={createTask.isPending}>
            {createTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Task
          </Button>
        </div>
      </form>
    </div>
  );
}
