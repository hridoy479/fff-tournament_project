'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase'; // ensure db is exported from firebase config

const ProfileDirectory = () => {
  const [user, setUser] = useState<User | null>(null);
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [gameBalance, setGameBalance] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setAccountBalance(data.accountBalance || 0);
          setGameBalance(data.gameBalance || 0);
        } else {
          toast.warning('User data not found.');
        }
      } else {
        toast.error('Please log in first.');
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 mt-28">
      <h2 className="text-2xl font-bold mb-6 text-center">My Profile</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Account Balance</h3>
            <p className="text-2xl font-bold">{accountBalance.toFixed(2)}টাকা</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Game Balance</h3>
            <p className="text-2xl font-bold">{gameBalance.toFixed(2)}টাকা</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl">
          <CardContent className="p-6 flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Add Money</h3>
            <input
              type="number"
              placeholder="Enter amount"
              className="px-3 py-2 rounded text-black"
            />
            <Button
              className="bg-white text-green-700 hover:bg-green-100"
              onClick={() => router.push('/add-money')}
            >
              Add Funds
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-full bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Joined Tournaments</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Free Fire Battle Royale - July 24</li>
              <li>COD Mobile 2v2 Clash - July 18</li>
              <li>Upcoming: PUBG Showdown</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileDirectory;
