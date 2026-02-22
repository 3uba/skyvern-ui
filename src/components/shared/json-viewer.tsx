'use client';

import { JsonView, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

interface JsonViewerProps {
  data: object | unknown[];
  shouldExpandNode?: (level: number) => boolean;
}

export function JsonViewer({ data, shouldExpandNode }: JsonViewerProps) {
  return (
    <div className="rounded-md bg-muted/50 p-4 overflow-auto max-h-96 text-sm">
      <JsonView
        data={data}
        shouldExpandNode={shouldExpandNode ?? ((level) => level < 2)}
        style={darkStyles}
      />
    </div>
  );
}
