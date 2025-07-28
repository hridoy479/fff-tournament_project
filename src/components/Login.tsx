'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';

export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful');
      router.push('/');
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string; message?: string };
        if (firebaseError.code === 'auth/user-not-found') {
          toast.info('No account found. Redirecting to signup...');
          setTimeout(() => {
            router.push('/signup');
          }, 2000);
        } else if (firebaseError.code === 'auth/wrong-password') {
          toast.error('Incorrect password');
        } else {
          toast.error(firebaseError.message || 'Login failed');
        }
      } else {
        toast.error('An unknown error occurred');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success('Google login successful');
      router.push('/');
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const firebaseError = error as { message?: string };
        toast.error(firebaseError.message || 'Google login failed');
      } else {
        toast.error('An unknown error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-red-900 p-4 mt-20">
      <Card className="w-full max-w-md shadow-lg border border-red-500">
        <CardHeader className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-red-600 via-white to-blue-500 bg-clip-text text-transparent animate-pulse"
              whileHover={{
                scale: 1.05,
                textShadow: '0px 0px 8px rgb(255, 0, 102)',
              }}
            >
              FFF-Tournament
            </motion.h1>
          </motion.div>
          <CardDescription className="mt-2">
            Enter your credentials to sign in
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full cursor-pointer">
              Login
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
            Login with Google
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don’t have an account?{' '}
            <a href="/signup" className="underline text-blue-400 hover:text-blue-600">
              Sign Up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
