'use client';

import { JsonViewer } from '@/components/shared/json-viewer';
import type { Run } from './types';
import { Settings, Globe, Shield } from 'lucide-react';

function ParamRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 py-2.5 border-b last:border-b-0">
      <dt className="w-48 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="flex-1 min-w-0 text-sm">{children}</dd>
    </div>
  );
}

export function RunParameters({ run }: { run: Run }) {
  const req = run.run_request;
  const isWorkflow = run.run_type === 'workflow_run';
  const params = req?.parameters;
  const hasParams = params && Object.keys(params).length > 0;

  return (
    <div className="space-y-6 overflow-auto">
      {/* Workflow input parameters */}
      {isWorkflow && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
            <Settings className="h-4 w-4 text-muted-foreground" />
            Workflow Input Parameters
          </h3>
          {hasParams ? (
            <div className="rounded-lg border bg-card">
              <dl className="px-4">
                {Object.entries(params).map(([key, value]) => (
                  <ParamRow key={key} label={key}>
                    {typeof value === 'string' ||
                    typeof value === 'number' ||
                    typeof value === 'boolean' ? (
                      <span className="font-mono text-xs break-all">
                        {String(value)}
                      </span>
                    ) : (
                      <div className="rounded-md border bg-muted/20 p-2">
                        <JsonViewer
                          data={value as object}
                          shouldExpandNode={(level) => level < 1}
                        />
                      </div>
                    )}
                  </ParamRow>
                ))}
              </dl>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No input parameters found for this workflow.
            </p>
          )}
        </section>
      )}

      {/* Task parameters */}
      {!isWorkflow && req && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
            <Settings className="h-4 w-4 text-muted-foreground" />
            Task Parameters
          </h3>
          <div className="rounded-lg border bg-card">
            <dl className="px-4">
              {req.prompt && (
                <ParamRow label="Prompt">
                  <p className="text-sm whitespace-pre-wrap">{req.prompt}</p>
                </ParamRow>
              )}
              {req.url && (
                <ParamRow label="URL">
                  <a
                    href={req.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all text-xs font-mono"
                  >
                    {req.url}
                  </a>
                </ParamRow>
              )}
              {req.navigation_goal && (
                <ParamRow label="Navigation Goal">
                  <p className="text-sm">{req.navigation_goal}</p>
                </ParamRow>
              )}
              {req.data_extraction_goal && (
                <ParamRow label="Data Extraction Goal">
                  <p className="text-sm">{req.data_extraction_goal}</p>
                </ParamRow>
              )}
              {req.data_extraction_schema != null && (
                <ParamRow label="Extraction Schema">
                  <div className="rounded-md border bg-muted/20 p-2">
                    <JsonViewer
                      data={req.data_extraction_schema as object}
                      shouldExpandNode={(level) => level < 1}
                    />
                  </div>
                </ParamRow>
              )}
              {req.engine && (
                <ParamRow label="Engine">
                  <span className="font-mono text-xs">{req.engine}</span>
                </ParamRow>
              )}
            </dl>
          </div>
        </section>
      )}

      {/* Other parameters */}
      {req && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Other Parameters
          </h3>
          <div className="rounded-lg border bg-card">
            <dl className="px-4">
              {req.webhook_url && (
                <ParamRow label="Webhook URL">
                  <span className="font-mono text-xs break-all">
                    {req.webhook_url}
                  </span>
                </ParamRow>
              )}
              {req.proxy_location && (
                <ParamRow label="Proxy Location">
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {req.proxy_location}
                  </span>
                </ParamRow>
              )}
              {req.max_screenshot_scrolls != null && (
                <ParamRow label="Max Screenshot Scrolls">
                  {req.max_screenshot_scrolls}
                </ParamRow>
              )}
              {req.extra_http_headers &&
                Object.keys(req.extra_http_headers).length > 0 && (
                  <ParamRow label="Extra HTTP Headers">
                    <div className="rounded-md border bg-muted/20 p-2">
                      <JsonViewer
                        data={req.extra_http_headers}
                        shouldExpandNode={() => true}
                      />
                    </div>
                  </ParamRow>
                )}
            </dl>
          </div>
        </section>
      )}

      {!req && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No parameters available.
          </p>
        </div>
      )}
    </div>
  );
}
