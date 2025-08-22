'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { auth } from '@/config/firebase';
import { useIsMobile } from '@/hooks/use-mobile';
import { fetchSignInMethodsForEmail, getRedirectResult } from 'firebase/auth';

// Email validation: starts with a letter, min 3 characters
const emailValidation = z.string()
  .email('Please enter a valid email address')
  .refine((val) => /^[A-Za-z][A-Za-z0-9._%+-]{2,}@/.test(val), {
    message: "Invalid email username (start with a letter and at least 3 chars)",
  });

const formSchema = z.object({
  email: emailValidation,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  // ✅ Handle Google redirect result (for mobile)
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const axios = (await import('axios')).default;
          const idToken = await result.user.getIdToken();

          await axios.post('/api/user/sync-profile', {}, {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          toast.success('Google login successful');
          router.push('/');
        }
      } catch (error: unknown) {
        const firebaseError = error as { message?: string };
        toast.error(firebaseError?.message || 'Google login failed');
      }
    };

    handleRedirect();
  }, [router]);

  // Check if email is already registered with Google
  const checkGoogleEmail = async (email: string) => {
    if (!email) return;
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.includes('google.com')) {
        toast.info('You are already signed up with Google. Redirecting to home page...');
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (error) {
      console.error('Error checking email:', error);
    }
  };

  // Email/password login
  const handleLogin = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const axios = (await import('axios')).default;

      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast.error('Please verify your email before logging in.');
        router.push('/verify-email');
        return;
      }

      const idToken = await user.getIdToken();

      await axios.post('/api/user/sync-profile', {}, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      toast.success('Login successful');
      router.push('/');
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === 'auth/user-not-found') {
        setError('email', { message: 'No account found with this email' });
        toast.info('No account found. Redirecting to signup...');
        setTimeout(() => router.push('/signup'), 2000);
      } else if (firebaseError.code === 'auth/wrong-password') {
        setError('password', { message: 'Incorrect password' });
        toast.error('Incorrect password');
      } else {
        toast.error(firebaseError.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { signInWithPopup, signInWithRedirect } = await import('firebase/auth');
      const { provider } = await import('@/config/firebase');
      const axios = (await import('axios')).default;

      if (auth.currentUser) {
        toast.info('You are already logged in. Press Sign In to continue in the popup.');
        setIsLoading(false);
        return;
      }

      if (isMobile) {
        await signInWithRedirect(auth, provider); // ✅ Mobile flow
      } else {
        const result = await signInWithPopup(auth, provider); // ✅ Desktop flow
        const idToken = await result.user.getIdToken();

        await axios.post('/api/user/sync-profile', {}, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        toast.success('Google login successful');
        router.push('/');
      }
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      toast.error(firebaseError?.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg border-border">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  disabled={isLoading}
                  className="pl-9 h-9"
                  {...register('email')}
                  onBlur={(e) => checkGoogleEmail(e.target.value)}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="sr-only">Password</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  disabled={isLoading}
                  className="pl-9 pr-9 h-9"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(prev => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full h-9" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-9" disabled={isLoading}>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline hover:text-primary">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;
