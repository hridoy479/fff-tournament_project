'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase'; // adjust path

import { redirect } from 'next/navigation';

export default function DashboardPage(): React.ReactElement | null {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hridoymolla479@gmail.com';

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <img src={user.photoURL || '/avatar-placeholder.png'} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Active Tournaments</div>
            <div className="text-3xl font-bold">12</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Registered Teams</div>
            <div className="text-3xl font-bold">150</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Upcoming Matches</div>
            <div className="text-3xl font-bold">24</div>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-3">Welcome, {user.displayName || user.email}</h3>
          <p className="text-sm text-muted-foreground">Use the sidebar to manage tournaments and view joined players.</p>
        </div>
      </div>
  );
}
