'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  useRun,
  useRunTimeline,
  useRunArtifacts,
  useCancelRun,
} from '@/hooks/use-runs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { StatusBadge } from '@/components/shared/status-badge';
import { PageSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { JsonViewer } from '@/components/shared/json-viewer';
import {
  RunOverview,
  RunOverviewTab,
  RecordingSection,
  OutputSection,
  RunParameters,
  RunCode,
  StepsTab,
  TimelineSidebar,
  TotpForm,
  HumanInteractionBanner,
} from '@/components/runs';
import type { Run, TimelineEntry, Artifact } from '@/components/runs';
import {
  ArrowLeft,
  Monitor,
  FileText,
  Settings,
  Video,
  Code,
  ListChecks,
  ExternalLink,
  XCircle,
  Pencil,
  Play,
  AlertTriangle,
} from 'lucide-react';

const ACTIVE_STATUSES = ['running', 'queued', 'created'];
const FINAL_STATUSES = [
  'completed',
  'failed',
  'terminated',
  'canceled',
  'cancelled',
  'timed_out',
];

function isRunActive(status: string) {
  return ACTIVE_STATUSES.includes(status);
}
function isRunFinished(status: string) {
  return FINAL_STATUSES.includes(status);
}

export default function RunDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = use(params);
  const { data: run, isLoading, error, refetch } = useRun(runId);
  const { data: timeline } = useRunTimeline(runId);
  const { data: artifacts } = useRunArtifacts(runId);
  const cancelMutation = useCancelRun(runId);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) return <PageSkeleton />;
  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const typedRun = run as Run;
  const typedTimeline = (timeline ?? []) as TimelineEntry[];
  const typedArtifacts = (artifacts ?? []) as Artifact[];
  const active = isRunActive(typedRun.status);
  const finished = isRunFinished(typedRun.status);
  const workflowId = typedRun.run_request?.workflow_id;

  // Steps tab is full-width (no sidebar)
  const showSidebar = activeTab !== 'steps';

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="mt-1" asChild>
          <Link href="/runs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight">
              {typedRun.run_request?.title || 'Run Detail'}
            </h1>
            <StatusBadge status={typedRun.status} />
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {runId}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {typedRun.app_url && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={typedRun.app_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 h-3 w-3" />
                Skyvern UI
              </a>
            </Button>
          )}

          {workflowId && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/workflows/${workflowId}/build`}>
                <Pencil className="mr-1.5 h-3 w-3" />
                Edit
              </Link>
            </Button>
          )}

          {active && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <XCircle className="mr-1.5 h-3 w-3" />
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this run? This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Back</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => cancelMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cancel Run
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {finished && workflowId && (
            <Button size="sm" asChild>
              <Link href={`/workflows/${workflowId}/run`}>
                <Play className="mr-1.5 h-3 w-3" />
                Rerun
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <RunOverview run={typedRun} />

      {/* ── Failure reason ─────────────────────────────────────────────────── */}
      {typedRun.failure_reason && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">
              {typedRun.status === 'terminated'
                ? 'Termination Reason'
                : 'Failure Reason'}
            </p>
            <p className="mt-0.5 text-sm text-destructive/90">
              {typedRun.failure_reason}
            </p>
          </div>
        </div>
      )}

      {/* ── Active run banners ─────────────────────────────────────────────── */}
      {active && (
        <HumanInteractionBanner
          timeline={typedTimeline}
          appUrl={typedRun.app_url}
        />
      )}
      {active && (
        <TotpForm
          runId={runId}
          totpIdentifier={typedRun.run_request?.totp_identifier as string | undefined}
          workflowId={typedRun.run_request?.workflow_id}
        />
      )}

      {/* ── Main content area ──────────────────────────────────────────────── */}
      <div className="flex gap-5 min-h-0 flex-1">
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview" className="gap-1.5">
                <Monitor className="h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="steps" className="gap-1.5">
                <ListChecks className="h-3.5 w-3.5" />
                Steps
              </TabsTrigger>
              <TabsTrigger value="output" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Output
              </TabsTrigger>
              <TabsTrigger value="parameters" className="gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                Parameters
              </TabsTrigger>
              <TabsTrigger value="recording" className="gap-1.5">
                <Video className="h-3.5 w-3.5" />
                Recording
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-1.5">
                <Code className="h-3.5 w-3.5" />
                Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <RunOverviewTab artifacts={typedArtifacts} />
            </TabsContent>

            <TabsContent value="steps" className="mt-4">
              <StepsTab timeline={typedTimeline} />
            </TabsContent>

            <TabsContent value="output" className="mt-4">
              <OutputSection run={typedRun} />
            </TabsContent>

            <TabsContent value="parameters" className="mt-4">
              <RunParameters run={typedRun} />
            </TabsContent>

            <TabsContent value="recording" className="mt-4">
              {typedRun.recording_url ? (
                <RecordingSection url={typedRun.recording_url} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Video className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No recording available for this run.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="code" className="mt-4">
              <RunCode artifacts={typedArtifacts} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Timeline Sidebar — hidden on Steps tab */}
        {showSidebar && (
          <div className="w-80 shrink-0 hidden lg:block">
            <TimelineSidebar run={typedRun} timeline={typedTimeline} />
          </div>
        )}
      </div>
    </div>
  );
}
