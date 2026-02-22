'use client';

import type { Artifact } from './types';
import {
  Image as ImageIcon,
  Video,
  FileText,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';

interface ArtifactGroup {
  label: string;
  icon: React.ElementType;
  items: Artifact[];
}

const ARTIFACT_FILTERS: {
  label: string;
  icon: React.ElementType;
  filter: (a: Artifact) => boolean;
}[] = [
  {
    label: 'Screenshots',
    icon: ImageIcon,
    filter: (a) => a.artifact_type.startsWith('screenshot'),
  },
  {
    label: 'Recordings',
    icon: Video,
    filter: (a) => a.artifact_type === 'recording',
  },
  {
    label: 'Logs & Traces',
    icon: FileText,
    filter: (a) =>
      a.artifact_type.includes('log') ||
      a.artifact_type === 'har' ||
      a.artifact_type === 'trace',
  },
];

export function ArtifactsSection({ artifacts }: { artifacts: Artifact[] }) {
  if (!artifacts || artifacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No artifacts available.
        </p>
      </div>
    );
  }

  // Categorize
  const categorized = new Set<string>();
  const groups: ArtifactGroup[] = ARTIFACT_FILTERS.map((g) => {
    const items = artifacts.filter((a) => {
      if (g.filter(a)) {
        categorized.add(a.artifact_id);
        return true;
      }
      return false;
    });
    return { label: g.label, icon: g.icon, items };
  }).filter((g) => g.items.length > 0);

  const other = artifacts.filter((a) => !categorized.has(a.artifact_id));
  if (other.length > 0) {
    groups.push({ label: 'Other', icon: FileText, items: other });
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <group.icon className="h-3.5 w-3.5" />
            {group.label} ({group.items.length})
          </h4>
          <div className="rounded-md border divide-y">
            {group.items.map((artifact) => {
              const url = artifact.signed_url || artifact.uri;
              return (
                <a
                  key={artifact.artifact_id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/30 transition-colors group"
                >
                  <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {artifact.artifact_type}
                  </span>
                  <span className="flex-1 truncate text-primary group-hover:underline">
                    {url.split('/').pop() || artifact.artifact_type}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
