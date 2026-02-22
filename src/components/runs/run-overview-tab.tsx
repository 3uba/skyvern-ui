'use client';

import { useMemo } from 'react';
import type { Artifact } from './types';
import { ScreenshotsSection } from './screenshots-section';
import { Monitor } from 'lucide-react';

/* eslint-disable @next/next/no-img-element */

export function RunOverviewTab({ artifacts }: { artifacts: Artifact[] }) {
  const screenshots = useMemo(
    () =>
      artifacts
        .filter(
          (a) =>
            a.artifact_type === 'screenshot_action' ||
            a.artifact_type === 'screenshot_final' ||
            a.artifact_type === 'screenshot',
        )
        .map((a) => a.signed_url || a.uri)
        .filter(Boolean) as string[],
    [artifacts],
  );

  if (screenshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Monitor className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No screenshots available for this run.
        </p>
      </div>
    );
  }

  return <ScreenshotsSection urls={screenshots} />;
}
