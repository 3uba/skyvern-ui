'use client';

import { useState } from 'react';
import { postApi } from '@/lib/api/fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { KeyRound, Loader2, Send } from 'lucide-react';

interface TotpFormProps {
  runId: string;
  totpIdentifier?: string;
  workflowId?: string;
}

export function TotpForm({ runId, totpIdentifier, workflowId }: TotpFormProps) {
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSending(true);
    try {
      const payload: Record<string, unknown> = {
        totp_identifier: totpIdentifier || 'default',
        content: code.trim(),
        workflow_run_id: runId,
      };
      if (workflowId) payload.workflow_id = workflowId;

      await postApi('credentials/totp', payload);
      toast.success('Verification code sent');
      setCode('');
    } catch {
      toast.error('Failed to send verification code');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/20">
      <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="flex-1 space-y-2">
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Verification Code Required
          </p>
          <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
            The automation is waiting for a 2FA / verification code.
            {totpIdentifier && (
              <> Identifier: <code className="font-mono">{totpIdentifier}</code></>
            )}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            className="max-w-[200px] h-8 bg-white dark:bg-background"
            autoComplete="one-time-code"
          />
          <Button type="submit" size="sm" disabled={!code.trim() || sending} variant="outline" className="h-8">
            {sending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-3.5 w-3.5" />
            )}
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
