'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Artifact } from './types';
import { proxyArtifactUrl } from '@/lib/utils/artifact-url';
import { Code, Copy, Check } from 'lucide-react';

export function RunCode({ artifacts }: { artifacts: Artifact[] }) {
  const scriptArtifacts = useMemo(
    () => artifacts.filter((a) => a.artifact_type === 'script_file'),
    [artifacts],
  );

  return (
    <div className="h-full">
      {scriptArtifacts.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <Code className="h-4 w-4 text-muted-foreground" />
              Generated Code
              <span className="text-xs text-muted-foreground">
                ({scriptArtifacts.length} file
                {scriptArtifacts.length !== 1 ? 's' : ''})
              </span>
            </h3>
          </div>
          {scriptArtifacts.map((artifact) => (
            <ScriptViewer key={artifact.artifact_id} artifact={artifact} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Code className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No code has been generated yet.
          </p>
        </div>
      )}
    </div>
  );
}

function ScriptViewer({ artifact }: { artifact: Artifact }) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const rawUrl = artifact.signed_url || artifact.uri;
  const url = proxyArtifactUrl(rawUrl);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setCode(text);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Failed to load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const copyCode = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-mono text-muted-foreground">
          {rawUrl.split('/').pop()?.split('?')[0] || 'script.py'}
        </span>
        {code && (
          <button
            onClick={copyCode}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            {copied ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      <div className="max-h-[600px] overflow-auto">
        {loading && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading code...
          </div>
        )}
        {error && (
          <div className="px-4 py-8 text-center text-sm text-destructive">
            {error}
          </div>
        )}
        {code && (
          <pre className="px-4 py-3 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre">
            {code}
          </pre>
        )}
      </div>
    </div>
  );
}
