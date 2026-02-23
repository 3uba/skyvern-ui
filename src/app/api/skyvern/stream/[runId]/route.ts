import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getSkyvernConfig } from '@/lib/api/skyvern-proxy';

/**
 * SSE proxy for Skyvern's WebSocket screenshot stream.
 *
 * Connects server-side to:
 *   ws://{skyvern}/api/v1/stream/workflow_runs/{id}  (for wr_ runs)
 *   ws://{skyvern}/api/v1/stream/tasks/{id}          (for task runs)
 *
 * Forwards base64 screenshots as Server-Sent Events to the browser.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;

  // Auth check
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get Skyvern config
  let config;
  try {
    config = await getSkyvernConfig();
  } catch {
    return new Response('Skyvern not configured', { status: 503 });
  }

  // Build WebSocket URL (convert http(s) to ws(s))
  const wsUrl = config.apiUrl.replace(/^http/, 'ws');
  // Pick the right stream endpoint based on run ID prefix
  const streamPath = runId.startsWith('wr_')
    ? `stream/workflow_runs/${runId}`
    : `stream/tasks/${runId}`;
  const streamUrl = `${wsUrl}/api/v1/${streamPath}?apikey=${config.apiKey}`;

  const encoder = new TextEncoder();
  let ws: WebSocket | null = null;

  const stream = new ReadableStream({
    start(controller) {
      try {
        ws = new WebSocket(streamUrl);
      } catch {
        // WebSocket not available (Node.js < 22) — tell client to fall back
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'websocket_unavailable' })}\n\n`),
        );
        controller.close();
        return;
      }

      ws.addEventListener('open', () => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ connected: true })}\n\n`),
        );
      });

      ws.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(String(event.data));
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(message)}\n\n`),
          );

          // Close on final status
          if (
            ['completed', 'failed', 'terminated', 'canceled', 'cancelled', 'timed_out', 'timeout', 'not_found'].includes(
              message.status,
            )
          ) {
            ws?.close();
            try {
              controller.close();
            } catch {
              /* already closed */
            }
          }
        } catch {
          // skip malformed messages
        }
      });

      ws.addEventListener('close', () => {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });

      ws.addEventListener('error', () => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'ws_error' })}\n\n`),
          );
          controller.close();
        } catch {
          /* already closed */
        }
      });

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        ws?.close();
      });
    },
    cancel() {
      ws?.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
