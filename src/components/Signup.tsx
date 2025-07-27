'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
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

  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  setLoading(true);

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    toast.success("Signup successful! Redirecting...");
    router.push('/tournaments');
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      toast.info('User already exists. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      toast.error(error.message || "Signup failed");
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
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="text-black"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="text-black"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password" className="text-white">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="********"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="text-black"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-white/70">
          Already have an account?{' '}
          <a href="/login" className="underline hover:text-pink-400">
            Log In
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
