'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Define the form schema with Zo
// Define the form schema with Zod
const formSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .refine((val) => {
      const localPart = val.split('@')[0];
      // at least 4 chars, must start with a letter
      return /^[A-Za-z][A-Za-z0-9._%+-]{2,}$/.test(localPart);
    }, {
      message: "Invalid email username (must start with a letter and be at least 3 characters before @)",
    }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


type FormValues = z.infer<typeof formSchema>;

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    try {
      // Dynamic imports for Firebase
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { doc, setDoc } = await import('firebase/firestore');
      const { auth, db } = await import('@/config/firebase');
      const axios = (await import('axios')).default;

      const userCredential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      const user = userCredential.user;

      // Create Firestore user doc with initial balances
      await setDoc(doc(db, 'users', user.uid), {
        accountBalance: 0,
        gameBalance: 0,
        createdAt: new Date(),
        email: user.email,
      });

      // Call backend to sync user profile to MongoDB
      const idToken = await user.getIdToken();
      await axios.post('/api/user/sync-profile', {}, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const { toast } = await import('react-toastify');
      toast.success('Signup successful! Redirecting...');
      router.push('/tournaments');
    } catch (error) {
      const { toast } = await import('react-toastify');
      const { FirebaseError } = await import('firebase/app');
      
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          setError('email', { message: 'Email already in use' });
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg border-border">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Sign up to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  disabled={loading}
                  className="pl-9 h-9"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="pl-9 pr-9 h-9"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="pl-9 pr-9 h-9"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-9"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
          
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
            </div>
          </div>
          
          <Button 
            asChild
            variant="outline" 
            className="w-full h-9"
          >
            <Link href="/login">
              Log In
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}