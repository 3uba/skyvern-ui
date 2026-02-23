'use client';

import { useMemo } from 'react';
import type { Run, Artifact, TimelineEntry, TimelineBlock } from './types';
import { proxyArtifactUrl } from '@/lib/utils/artifact-url';
import { useRunStream } from '@/hooks/use-run-stream';
import { useBlockArtifacts } from '@/hooks/use-runs';
import { ScreenshotsSection } from './screenshots-section';
import { Monitor, Radio, Loader2 } from 'lucide-react';

/* eslint-disable @next/next/no-img-element */

interface ScreenshotsTabProps {
  run: Run;
  artifacts: Artifact[];
  timeline?: TimelineEntry[];
  isActive?: boolean;
}

const SCREENSHOT_TYPES = [
  'screenshot_action',
  'screenshot_final',
  'screenshot',
  'screenshot_streaming',
  'screenshot_llm',
];

/** Find the currently-running block, or the last block if none running */
function findBestBlock(entries: TimelineEntry[]): TimelineBlock | null {
  let runningBlock: TimelineBlock | null = null;
  let lastBlock: TimelineBlock | null = null;

  function walk(items: TimelineEntry[]) {
    for (const entry of items) {
      if (entry.block) {
        lastBlock = entry.block;
        if (entry.block.status === 'running') {
          runningBlock = entry.block;
        }
      }
      if (entry.children?.length) {
        walk(entry.children);
      }
    }
  }

  walk(entries);
  return runningBlock ?? lastBlock;
}

export function ScreenshotsTab({
  run,
  artifacts,
  timeline = [],
  isActive,
}: ScreenshotsTabProps) {
  // ── 1. Find the best block and fetch its artifacts ──
  const bestBlock = useMemo(() => findBestBlock(timeline), [timeline]);
  const blockId = bestBlock?.workflow_run_block_id ?? null;
  const { data: blockArtifacts } = useBlockArtifacts(blockId, !!isActive);

  const blockScreenshotUrl = useMemo(() => {
    if (!Array.isArray(blockArtifacts)) return null;
    const screenshots = blockArtifacts.filter(
      (a: Artifact) => a.artifact_type === 'screenshot_llm',
    );
    const screenshot = screenshots[screenshots.length - 1];
    if (!screenshot) return null;
    const raw = screenshot.signed_url || screenshot.uri;
    return raw ? proxyArtifactUrl(raw) : null;
  }, [blockArtifacts]);

  // ── 2. Screenshots from run.screenshot_urls (chronological: oldest → newest) ──
  const runScreenshotUrls = useMemo(
    () =>
      (run.screenshot_urls ?? [])
        .map((url) => proxyArtifactUrl(url))
        .filter(Boolean),
    [run.screenshot_urls],
  );

  // ── 3. Screenshots from run-level artifacts (sorted oldest → newest) ──
  const artifactScreenshotUrls = useMemo(
    () =>
      artifacts
        .filter((a) => SCREENSHOT_TYPES.includes(a.artifact_type))
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime(),
        )
        .map((a) => proxyArtifactUrl(a.signed_url || a.uri))
        .filter(Boolean) as string[],
    [artifacts],
  );

  // All screenshots for gallery (chronological order)
  const allScreenshotUrls = useMemo(() => {
    if (runScreenshotUrls.length > 0) return runScreenshotUrls;
    if (artifactScreenshotUrls.length > 0) return artifactScreenshotUrls;
    return [];
  }, [runScreenshotUrls, artifactScreenshotUrls]);

  const latestScreenshot =
    allScreenshotUrls.length > 0
      ? allScreenshotUrls[allScreenshotUrls.length - 1]
      : null;

  // ── 4. Live stream (WebSocket via SSE proxy) ──
  const stream = useRunStream(run.run_id, !!isActive);

  const hasBlockScreenshot = !!blockScreenshotUrl;
  const hasScreenshots = !!latestScreenshot;
  const hasLiveStream = !!isActive && !!stream.screenshot;

  return (
    <div className="space-y-4">
      {/* ── Main screenshot area ────────────────────────────────────── */}
      {hasLiveStream ? (
        <LiveView
          src={`data:image/png;base64,${stream.screenshot}`}
          alt="Live browser view"
        />
      ) : isActive && hasBlockScreenshot ? (
        <LiveView src={blockScreenshotUrl} alt="Live browser view" />
      ) : isActive && hasScreenshots ? (
        <LiveView src={latestScreenshot} alt="Live browser view" />
      ) : isActive ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed aspect-video bg-muted/20">
          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">
            Waiting for screenshots...
          </p>
        </div>
      ) : hasScreenshots ? (
        <ScreenshotsSection
          urls={allScreenshotUrls}
          defaultIndex={allScreenshotUrls.length - 1}
        />
      ) : hasBlockScreenshot ? (
        <div className="overflow-hidden rounded-lg border bg-muted/30">
          <img
            src={blockScreenshotUrl}
            alt="Browser screenshot"
            className="w-full"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed aspect-video">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Monitor className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No screenshots available for this run.
          </p>
        </div>
      )}
    </div>
  );
}

/** Live view wrapper with LIVE badge */
function LiveView({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative rounded-lg border bg-black overflow-hidden">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white shadow-lg">
        <Radio className="h-3 w-3 animate-pulse" />
        LIVE
      </div>
      <img src={src} alt={alt} className="w-full" />
    </div>
  );
}
