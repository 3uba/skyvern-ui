'use client';

import { useState } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pause, Play, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface LiveViewportProps {
  wsUrl: string | null;
  title?: string;
}

export function LiveViewport({ wsUrl, title = 'Live Preview' }: LiveViewportProps) {
  const { isConnected, lastMessage } = useWebSocket(wsUrl);
  const [paused, setPaused] = useState(false);
  const [zoom, setZoom] = useState(100);

  const screenshot =
    lastMessage && typeof lastMessage === 'object' && 'screenshot' in (lastMessage as Record<string, unknown>)
      ? (lastMessage as Record<string, string>).screenshot
      : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'default' : 'secondary'} className="text-xs">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom(Math.max(25, zoom - 25))}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <span className="text-xs text-muted-foreground w-8 text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom(Math.min(200, zoom + 25))}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPaused(!paused)}
            >
              {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video rounded-md bg-muted/50 border overflow-hidden">
          {screenshot && !paused ? (
            <img
              src={`data:image/png;base64,${screenshot}`}
              alt="Browser view"
              className="w-full h-full object-contain"
              style={{ transform: `scale(${zoom / 100})` }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Maximize2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{paused ? 'Paused' : 'Waiting for browser stream...'}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
