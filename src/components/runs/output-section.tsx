'use client';

import { JsonViewer } from '@/components/shared/json-viewer';
import type { Run, FileInfo } from './types';
import { FileText, AlertCircle, Download, Database } from 'lucide-react';

export function OutputSection({ run }: { run: Run }) {
  const hasOutput =
    run.output !== null &&
    run.output !== undefined &&
    typeof run.output === 'object' &&
    Object.keys(run.output as Record<string, unknown>).length > 0;
  const hasErrors = run.errors && run.errors.length > 0;
  const hasFiles = run.downloaded_files && run.downloaded_files.length > 0;

  if (!hasOutput && !hasErrors && !hasFiles) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No output data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Run Outputs */}
      {hasOutput && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
            <Database className="h-4 w-4 text-muted-foreground" />
            Workflow Run Outputs
          </h3>
          <div className="rounded-lg border bg-card p-4">
            <JsonViewer data={run.output as Record<string, unknown>} />
          </div>
        </section>
      )}

      {/* Downloaded Files */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
          <Download className="h-4 w-4 text-muted-foreground" />
          Workflow Run Downloaded Files
        </h3>
        {hasFiles ? (
          <div className="rounded-lg border bg-card divide-y">
            {run.downloaded_files!.map((file, i) => {
              const fileUrl = typeof file === 'string' ? file : (file as FileInfo).url;
              const fileName =
                typeof file === 'string'
                  ? file.split('/').pop()?.split('?')[0] || `File ${i + 1}`
                  : (file as FileInfo).name;
              return (
                <a
                  key={i}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors group"
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-primary group-hover:underline">
                    {fileName}
                  </span>
                </a>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No files downloaded.</p>
        )}
      </section>

      {/* Errors */}
      {hasErrors && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-medium text-destructive mb-3">
            <AlertCircle className="h-4 w-4" />
            Errors
          </h3>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <JsonViewer data={run.errors!} />
          </div>
        </section>
      )}
    </div>
  );
}
