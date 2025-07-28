'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/config/firebase';

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

export default function Signup() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      toast.success('Signup successful! Redirecting...');
      router.push('/tournaments');
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          toast.info('User already exists. Redirecting to login...');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          toast.error(error.message || 'Signup failed');
        }
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-pink-900 p-6 mt-16">
      <Card className="w-full max-w-md shadow-lg border border-pink-500">
        <CardHeader className="text-center">
          <motion.h1
            className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-white to-purple-500 bg-clip-text text-transparent animate-pulse"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Create Your Account
          </motion.h1>
          <CardDescription className="mt-2 text-white/80">
            Sign up with your email and password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup}>
            <fieldset disabled={loading} className="space-y-6">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-white/90">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Label htmlFor="password" className="text-white/90">
                  Password
                </Label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 pt-4 -translate-y-1/2 text-gray-400 hover:text-pink-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOpenIcon />
                  ) : (
                    <EyeClosedIcon />
                  )}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Label htmlFor="confirm-password" className="text-white/90">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="********"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 pt-4 -translate-y-1/2 text-gray-400 hover:text-pink-500"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOpenIcon />
                  ) : (
                    <EyeClosedIcon />
                  )}
                </button>
              </div>

              <Button type="submit" className="w-full">
                {loading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </fieldset>
          </form>
        </CardContent>

        <CardFooter className="text-center text-white/70">
          Already have an account?{' '}
          <Link href="/login" className="underline hover:text-pink-400 ml-1">
            Log In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// Eye open icon
function EyeOpenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

// Eye closed icon
function EyeClosedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m1.414-1.414A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.197M15 12a3 3 0 11-6 0 3 3 0 016 0zm-7.071 7.071l12-12" />
    </svg>
  );
}
