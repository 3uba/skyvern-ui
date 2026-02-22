'use client';

import { useState } from 'react';
import { useCredentials, useCreateCredential, useDeleteCredential } from '@/hooks/use-credentials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { formatDate } from '@/lib/utils/format-date';
import { Plus, KeyRound, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

type CredentialType = 'password' | 'credit_card' | 'secret';

export default function CredentialsPage() {
  const { data, isLoading, error, refetch } = useCredentials();
  const createCredential = useCreateCredential();
  const deleteCredential = useDeleteCredential();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [credType, setCredType] = useState<CredentialType>('password');
  const [name, setName] = useState('');

  // Password fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');

  // Credit card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardExpMonth, setCardExpMonth] = useState('');
  const [cardExpYear, setCardExpYear] = useState('');
  const [cardBrand, setCardBrand] = useState('');

  // Secret fields
  const [secretValue, setSecretValue] = useState('');
  const [secretLabel, setSecretLabel] = useState('');

  const credentials = Array.isArray(data) ? data : [];

  const resetForm = () => {
    setName('');
    setCredType('password');
    setUsername('');
    setPassword('');
    setTotp('');
    setCardNumber('');
    setCardCvv('');
    setCardExpMonth('');
    setCardExpYear('');
    setCardBrand('');
    setSecretValue('');
    setSecretLabel('');
  };

  const buildPayload = () => {
    const base = { name, credential_type: credType };
    switch (credType) {
      case 'password':
        return {
          ...base,
          credential: {
            username,
            password,
            ...(totp ? { totp } : {}),
          },
        };
      case 'credit_card':
        return {
          ...base,
          credential: {
            card_number: cardNumber,
            card_cvv: cardCvv,
            card_exp_month: cardExpMonth,
            card_exp_year: cardExpYear,
            ...(cardBrand ? { card_brand: cardBrand } : {}),
          },
        };
      case 'secret':
        return {
          ...base,
          credential: {
            secret_value: secretValue,
            ...(secretLabel ? { secret_label: secretLabel } : {}),
          },
        };
    }
  };

  const isFormValid = () => {
    if (!name) return false;
    switch (credType) {
      case 'password':
        return !!username && !!password;
      case 'credit_card':
        return !!cardNumber && !!cardCvv && !!cardExpMonth && !!cardExpYear;
      case 'secret':
        return !!secretValue;
    }
  };

  const handleCreate = async () => {
    try {
      await createCredential.mutateAsync(buildPayload());
      toast.success('Credential created');
      setCreateOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to create credential');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCredential.mutateAsync(deleteId);
      toast.success('Credential deleted');
    } catch {
      toast.error('Failed to delete credential');
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Credentials</h1>
          <p className="text-muted-foreground">Manage stored credentials for automation</p>
        </div>
        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Credential
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Credential</DialogTitle>
              <DialogDescription>Store a credential for use in automation tasks</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g. Amazon Login"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={credType} onValueChange={(v) => setCredType(v as CredentialType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="password">Password</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="secret">Secret</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {credType === 'password' && (
                <>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      placeholder="user@example.com"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>TOTP Secret (optional)</Label>
                    <Input
                      placeholder="JBSWY3DPEHPK3PXP"
                      value={totp}
                      onChange={(e) => setTotp(e.target.value)}
                    />
                  </div>
                </>
              )}

              {credType === 'credit_card' && (
                <>
                  <div className="space-y-2">
                    <Label>Card Number</Label>
                    <Input
                      placeholder="4111111111111111"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Exp Month</Label>
                      <Input
                        placeholder="12"
                        value={cardExpMonth}
                        onChange={(e) => setCardExpMonth(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Exp Year</Label>
                      <Input
                        placeholder="2025"
                        value={cardExpYear}
                        onChange={(e) => setCardExpYear(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input
                        type="password"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Brand (optional)</Label>
                      <Input
                        placeholder="Visa"
                        value={cardBrand}
                        onChange={(e) => setCardBrand(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {credType === 'secret' && (
                <>
                  <div className="space-y-2">
                    <Label>Secret Value</Label>
                    <Input
                      type="password"
                      placeholder="sk-abc123..."
                      value={secretValue}
                      onChange={(e) => setSecretValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (optional)</Label>
                    <Input
                      placeholder="API Key for..."
                      value={secretLabel}
                      onChange={(e) => setSecretLabel(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createCredential.isPending || !isFormValid()}>
                {createCredential.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <TableSkeleton cols={4} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : credentials.length === 0 ? (
        <EmptyState
          icon={<KeyRound className="h-12 w-12" />}
          title="No credentials"
          description="Add credentials to use in your automation tasks"
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Credential
            </Button>
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {credentials.map((cred: Record<string, string>) => (
                <TableRow key={cred.credential_id}>
                  <TableCell className="font-medium">{cred.name || cred.credential_id}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{cred.credential_type || 'unknown'}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {cred.created_at ? formatDate(cred.created_at) : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteId(cred.credential_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Credential"
        description="Are you sure you want to delete this credential? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
