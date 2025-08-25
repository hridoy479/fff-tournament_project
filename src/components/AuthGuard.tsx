'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          setLoading(false);
        } else {
          router.push('/');
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return <>{children}</>;
};

export default AuthGuard;
