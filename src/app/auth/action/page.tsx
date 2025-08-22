'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/config/firebase';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

export default function AuthActionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState('');

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (mode === 'verifyEmail' && oobCode) {
      handleVerifyEmail(oobCode);
    } else {
      setError('Invalid action. Please try again.');
    }
  }, [searchParams]);

  const handleVerifyEmail = async (oobCode: string) => {
    try {
      await applyActionCode(auth, oobCode);

      // After successful verification in Firebase, update the backend
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        await axios.post(
          '/api/user/verify-email',
          {},
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
      }

      setMessage('Email verified successfully! Redirecting to login...');
      toast.success('Email verified successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError('Failed to verify email. The link may be expired or invalid.');
      toast.error('Failed to verify email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm text-center">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
