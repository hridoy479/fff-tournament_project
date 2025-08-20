'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
// import { doc, getDoc } from 'firebase/firestore'; // Remove Firestore imports
// import { db } from '@/config/firebase'; // Remove Firestore imports
import { Wallet, Gamepad2, PlusCircle, Trophy } from 'lucide-react';
import axios from 'axios'; // Add axios import

const ProfileDirectory = () => {
  const [user, setUser] = useState<User | null>(null);
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [gameBalance, setGameBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [joinedTournaments, setJoinedTournaments] = useState<any[]>([]); // State for joined tournaments
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const idToken = await currentUser.getIdToken(); // Get Firebase ID token

          // Fetch user profile from our backend API
          const profileResponse = await axios.get('/api/user/profile', {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          setAccountBalance(profileResponse.data.accountBalance || 0);
          setGameBalance(profileResponse.data.gameBalance || 0);

          // Fetch joined tournaments from our backend API
          const joinedTournamentsResponse = await axios.get('/api/dashboard/joined', {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          setJoinedTournaments(joinedTournamentsResponse.data.joinedTournaments || []);

        } catch (error: any) {
          console.error('Error fetching profile or joined tournaments:', error);
          toast.error(error.response?.data?.message || 'Failed to load profile data.');
          // If token is invalid or user not found, redirect to login
          if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
            toast.error('Session expired or user not found. Please log in again.');
            router.push('/login');
          }
        } finally {
          setLoading(false);
        }
      } else {
        toast.error('Please log in first.');
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p> {/* Replace with a proper skeleton loader */}
      </div>
    );
  }

  if (!user) return null; // Should be handled by loading state and redirect

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 mt-20">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">{user.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="rounded-xl border shadow-sm hover:shadow-md transition">
          <CardContent className="p-6 flex flex-col items-start">
            <Wallet className="h-6 w-6 text-primary mb-3" />
            <h3 className="text-sm font-medium text-muted-foreground">Account Balance</h3>
            <p className="text-2xl font-bold mt-1">{accountBalance.toFixed(2)} টাকা</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm hover:shadow-md transition">
          <CardContent className="p-6 flex flex-col items-start">
            <Gamepad2 className="h-6 w-6 text-primary mb-3" />
            <h3 className="text-sm font-medium text-muted-foreground">Game Balance</h3>
            <p className="text-2xl font-bold mt-1">{gameBalance.toFixed(2)} টাকা</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm hover:shadow-md transition">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-6 w-6 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground">Add Money</h3>
            </div>
            <input
              type="number"
              placeholder="Enter amount min-100"
              className="px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              variant="default"
              onClick={() => router.push('/add-money')}
              className="w-full"
            >
              Add Funds
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tournaments */}
      <Card className="mt-10 rounded-xl border shadow-sm hover:shadow-md transition">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">Joined Tournaments</h3>
          </div>
          {joinedTournaments.length > 0 ? (
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              {joinedTournaments.map((jt: any) => (
                <li key={jt._id}>
                  {jt.tournamentDetails?.title} - {new Date(jt.tournamentDetails?.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No tournaments joined yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileDirectory;