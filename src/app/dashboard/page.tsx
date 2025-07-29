'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase'; // adjust path

import { redirect } from 'next/navigation';

export default function DashboardPage(): React.ReactElement | null {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const SUPER_ADMIN_EMAIL = 'hridoymolla479@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Optional: Loading state while checking auth
  if (loading) return <div>Loading...</div>;

  // 🚫 If user is not authenticated or not super admin, redirect
  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/'); // or redirect('/login')
  }

  // ✅ Show dashboard to super admin
  return (
    
      <div className="flex flex-col h-screen mt-28">
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p>Welcome, {user.displayName || user.email}!</p>
          {/* Add your dashboard content here */}
        </div>
        </div>

  );
}
