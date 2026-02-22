'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CopyButton } from '@/components/shared/copy-button';
import { Variable, FileText, Lock, Database } from 'lucide-react';

interface ParametersPanelProps {
  parameters: Record<string, unknown>[];
}

const PARAM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  workflow: Variable,
  output: FileText,
  credential: Lock,
  context: Database,
};

const PARAM_COLORS: Record<string, string> = {
  workflow: 'bg-blue-100 text-blue-700',
  output: 'bg-gray-100 text-gray-600',
  credential: 'bg-red-100 text-red-700',
  context: 'bg-purple-100 text-purple-700',
};

export function ParametersPanel({ parameters }: ParametersPanelProps) {
  const workflowParams = parameters.filter(
    (p) => (p.parameter_type as string) === 'workflow',
  );

  if (workflowParams.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-6">
        No input parameters
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-1">
        {workflowParams.map((param) => {
          const key = param.key as string;
          const pType = (param.parameter_type || 'workflow') as string;
          const wpType = (param.workflow_parameter_type || 'string') as string;
          const Icon = PARAM_ICONS[pType] || Variable;
          const colorClass = PARAM_COLORS[pType] || 'bg-gray-100 text-gray-600';

          return (
            <div
              key={key}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/50 group"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <code className="text-xs font-medium truncate">{key}</code>
                  <Badge variant="outline" className={`text-[10px] px-1 py-0 ${colorClass}`}>
                    {wpType}
                  </Badge>
                </div>
                {typeof param.description === 'string' && param.description && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {param.description}
                  </p>
                )}
              </div>
              <CopyButton
                value={`{{ ${key} }}`}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
