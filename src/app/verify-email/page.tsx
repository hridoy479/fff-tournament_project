'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { sendEmailVerification } from 'firebase/auth';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleResendVerification = async () => {
    if (!user) {
      toast.error('You are not logged in.');
      return;
    }
    setLoading(true);
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent again. Please check your inbox.');
    } catch (error) {
      toast.error('Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  if (user && user.emailVerified) {
    router.push('/tournaments');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg border-border">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-xl text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            A verification email has been sent to <strong>{user?.email}</strong>. Please check your inbox and follow the instructions to activate your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Button 
            onClick={handleResendVerification} 
            className="w-full h-9"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Resend Verification Email'
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            If you don't see the email, please check your spam folder.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
