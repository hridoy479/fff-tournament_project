'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
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
import axios from 'axios';

export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Call backend to sync user profile to MongoDB
      const idToken = await userCredential.user.getIdToken();
      await axios.post('/api/user/sync-profile', {}, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
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
      const result = await signInWithPopup(auth, provider);
      // Call backend to sync user profile to MongoDB
      const idToken = await result.user.getIdToken();
      await axios.post('/api/user/sync-profile', {}, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-red-900 p-4 mt-16">
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m1.875-2.25A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-1.875 2.25A9.956 9.956 0 0112 21c-1.657 0-3.22-.403-4.575-1.125M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
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
