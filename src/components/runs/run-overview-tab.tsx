'use client';

import { useMemo } from 'react';
import type { Run, Artifact } from './types';
import { proxyArtifactUrl } from '@/lib/utils/artifact-url';
import { Globe, Target, FileText, Download } from 'lucide-react';

/* eslint-disable @next/next/no-img-element */

interface RunOverviewTabProps {
  run: Run;
  artifacts: Artifact[];
}

const SCREENSHOT_TYPES = [
  'screenshot_action',
  'screenshot_final',
  'screenshot',
  'screenshot_streaming',
  'screenshot_llm',
];

export function RunOverviewTab({ run, artifacts }: RunOverviewTabProps) {
  // Latest screenshot for the preview thumbnail
  const latestScreenshot = useMemo(() => {
    const urls = (run.screenshot_urls ?? [])
      .map((url) => proxyArtifactUrl(url))
      .filter(Boolean);
    if (urls.length > 0) return urls[urls.length - 1];

    const fromArtifacts = artifacts
      .filter((a) => SCREENSHOT_TYPES.includes(a.artifact_type))
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
      .map((a) => proxyArtifactUrl(a.signed_url || a.uri))
      .filter(Boolean);
    return fromArtifacts[fromArtifacts.length - 1] ?? null;
  }, [run.screenshot_urls, artifacts]);

  const url = run.run_request?.url;
  const goal = run.run_request?.navigation_goal || run.run_request?.prompt;
  const downloadedFiles = run.downloaded_files ?? [];

  return (
    <div className="space-y-4">
      {/* URL */}
      {url && (
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
          <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-primary hover:underline"
          >
            {url}
          </a>
        </div>
      )}

      {/* Goal / Prompt */}
      {goal && (
        <div className="flex items-start gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
          <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">{goal}</span>
        </div>
      )}

      {/* Last screenshot preview */}
      {latestScreenshot && (
        <div className="overflow-hidden rounded-lg border bg-muted/30">
          <img
            src={latestScreenshot}
            alt="Final browser state"
            className="w-full"
          />
        </div>
      )}

      {/* Downloaded files */}
      {downloadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-1.5 text-sm font-medium">
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            Downloaded Files
          </h3>
          <div className="space-y-1">
            {downloadedFiles.map((file, i) => {
              const name = typeof file === 'string' ? file : file.name;
              const fileUrl = typeof file === 'string' ? file : file.url;
              return (
                <a
                  key={i}
                  href={proxyArtifactUrl(fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded border bg-card px-3 py-1.5 text-sm text-primary hover:underline"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  {name}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
