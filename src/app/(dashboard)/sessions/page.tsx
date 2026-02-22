'use client';

import { useBrowserSessions, useCreateBrowserSession, useCloseBrowserSession } from '@/hooks/use-sessions';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { formatDate } from '@/lib/utils/format-date';
import { CopyButton } from '@/components/shared/copy-button';
import { Plus, Globe, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function SessionsPage() {
  const { data, isLoading, error, refetch } = useBrowserSessions();
  const createSession = useCreateBrowserSession();
  const closeSession = useCloseBrowserSession();

  const sessions = Array.isArray(data) ? data : [];

  const handleCreate = async () => {
    try {
      await createSession.mutateAsync({});
      toast.success('Browser session created');
    } catch {
      toast.error('Failed to create session');
    }
  };

  const handleClose = async (sessionId: string) => {
    try {
      await closeSession.mutateAsync(sessionId);
      toast.success('Session closed');
    } catch {
      toast.error('Failed to close session');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Browser Sessions</h1>
          <p className="text-muted-foreground">Active browser automation sessions</p>
        </div>
        <Button onClick={handleCreate} disabled={createSession.isPending}>
          {createSession.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New Session
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton cols={4} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<Globe className="h-12 w-12" />}
          title="No active sessions"
          description="Create a browser session to start automating"
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </Button>
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session: Record<string, string>) => (
                <TableRow key={session.browser_session_id}>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-1">
                      {session.browser_session_id?.slice(0, 12)}...
                      <CopyButton value={session.browser_session_id} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={session.status || 'active'} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {session.created_at ? formatDate(session.created_at) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleClose(session.browser_session_id)}
                      disabled={closeSession.isPending}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Close
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
