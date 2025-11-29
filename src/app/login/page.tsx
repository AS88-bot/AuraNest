'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';

export default function LoginPage() {
    const { auth } = useFirebase();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState<null | 'email'>(null);
    const [error, setError] = useState<string | null>(null);

    const handleEmailSignIn = async () => {
        if (!auth) return;
        setIsLoading('email');
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(null);
        }
    }

    const handleSignUp = async () => {
        if (!auth) return;
        setIsLoading('email');
        setError(null);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(null);
        }
    }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center gap-4 mb-8 text-primary">
            <BrainCircuit className="h-12 w-12" />
            <h1 className="text-5xl font-bold">AuraNest</h1>
        </div>
      <Tabs defaultValue="sign-in" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Create Account</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your personalized dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input id="email-signin" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin">Password</Label>
                <Input id="password-signin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleEmailSignIn} disabled={isLoading === 'email'} className="w-full">
                {isLoading === 'email' ? <Loader2 className="animate-spin" /> : 'Sign In'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sign-up">
          <Card>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>
                Enter your email and a password to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input id="email-signup" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
               {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleSignUp} disabled={isLoading === 'email'} className="w-full">
                {isLoading === 'email' ? <Loader2 className="animate-spin" /> : 'Create Account'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
