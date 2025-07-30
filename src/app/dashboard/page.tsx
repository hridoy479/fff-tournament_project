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
    
      <div className="flex flex-col h-screen mx-auto lg:ml-80 lg:mt-10">
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="dark:bg-[#1A2A80] rounded-lg shadow-md p-6 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Welcome, {user.displayName || user.email}!</h2>
              <p className="text-gray-600">You are logged in as <span className="font-medium text-blue-600">Super Admin</span>.</p>
            </div>
            <img
              src={user.photoURL || '/avatar-placeholder.png'}
              alt="Profile"
              className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"
            />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg p-5 shadow flex flex-col items-center">
              <span className="text-3xl font-bold mb-2">12</span>
              <span className="text-lg">Active Tournaments</span>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg p-5 shadow flex flex-col items-center">
              <span className="text-3xl font-bold mb-2">150</span>
              <span className="text-lg">Registered Teams</span>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg p-5 shadow flex flex-col items-center">
              <span className="text-3xl font-bold mb-2">24</span>
              <span className="text-lg">Upcoming Matches</span>
            </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">Create Tournament</button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">Add Team</button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition">Schedule Match</button>
            </div>
            </div>
          {/* Add your dashboard content here */}
        </div>
      </div>
  );
}
