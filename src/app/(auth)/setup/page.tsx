'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Bot, Eye, EyeOff, Loader2 } from 'lucide-react';

const setupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    skyvernApiKey: z.string().optional(),
    skyvernApiUrl: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SetupValues = z.infer<typeof setupSchema>;

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showKey, setShowKey] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
  });

  useEffect(() => {
    fetch('/api/setup/status')
      .then((res) => res.json())
      .then((data) => {
        if (!data.needsSetup) {
          router.replace('/login');
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  const onSubmit = async (values: SetupValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          skyvernApiKey: values.skyvernApiKey || undefined,
          skyvernApiUrl: values.skyvernApiUrl || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Setup failed');
        return;
      }

      // Sign in to get a session
      const { signIn } = await import('@/lib/auth/auth-client');
      const signInResult = await signIn.email({
        email: values.email,
        password: values.password,
      });

      if (signInResult.error) {
        toast.error('Account created but sign-in failed. Please sign in manually.');
        router.push('/login');
        return;
      }

      toast.success('Admin account created');
      router.push('/dashboard');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
          <Bot className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Welcome to Skyvern</h1>
        <p className="text-sm text-muted-foreground">Create your admin account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Initial Setup</CardTitle>
          <CardDescription>
            This is the first time running Skyvern. Create an admin account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" {...register('name')} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium">Skyvern API Configuration</p>
              <p className="text-xs text-muted-foreground">
                Connect to your Skyvern backend. You can also configure this later in Settings.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skyvernApiKey">Skyvern API Key</Label>
              <div className="relative">
                <Input
                  id="skyvernApiKey"
                  type={showKey ? 'text' : 'password'}
                  placeholder="Enter your Skyvern API key"
                  className="pr-10"
                  {...register('skyvernApiKey')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skyvernApiUrl">Skyvern API URL (optional)</Label>
              <Input
                id="skyvernApiUrl"
                placeholder="http://skyvern:8000"
                {...register('skyvernApiUrl')}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use the default internal URL
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Admin Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
