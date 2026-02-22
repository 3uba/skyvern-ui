'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { Bot } from 'lucide-react';

export default function LoginPage() {
  const [tab, setTab] = useState('login');

  return (
    <div className="w-full max-w-md px-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
          <Bot className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Skyvern</h1>
        <p className="text-sm text-muted-foreground">Browser automation powered by AI</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {tab === 'login' ? (
            <>
              <CardTitle className="sr-only">Sign In</CardTitle>
              <CardDescription className="sr-only">Enter your credentials</CardDescription>
              <LoginForm />
            </>
          ) : (
            <>
              <CardTitle className="sr-only">Register</CardTitle>
              <CardDescription className="sr-only">Create a new account</CardDescription>
              <RegisterForm />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
