'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage(): React.ReactElement | null {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [tournamentCount, setTournamentCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [upcomingMatches, setUpcomingMatches] = useState<number>(0);
  const [loadingData, setLoadingData] = useState(true);
  const [categoryStats, setCategoryStats] = useState<{ category: string; matches: number }[]>([]);

  const router = useRouter();
  const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hridoymolla479@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingData(true);
        const tournamentsRes = await axios.get('/api/tournaments');
        const usersRes = await axios.get('/api/user');

        const tournaments = tournamentsRes.data.tournaments || [];
        const users = usersRes.data.users || [];

        setTournamentCount(tournaments.length);
        setUserCount(users.length);
        setUpcomingMatches(
          tournaments.filter((t: any) => new Date(t.date) > new Date()).length
        );

        // Build category stats for graph
        const statsMap: { [key: string]: number } = {};
        tournaments.forEach((t: any) => {
          statsMap[t.category] = (statsMap[t.category] || 0) + 1;
        });

        const statsArray = Object.entries(statsMap).map(([category, matches]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          matches,
        }));

        setCategoryStats(statsArray);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    if (user && user.email === SUPER_ADMIN_EMAIL) {
      fetchDashboardData();
    }
  }, [user]);

  if (loadingAuth) return <div>Loading authentication...</div>;

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    router.push('/');
    return null;
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-3">
          <img
            src={user.photoURL || '/avatar-placeholder.png'}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <Button onClick={() => router.push('/dashboard/add-tournament')}>Add Tournament</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-muted-foreground">Active Tournaments</h3>
          </CardHeader>
          <CardContent>
            {loadingData ? <Skeleton className="h-10 w-24" /> : <span className="text-2xl font-bold">{tournamentCount}</span>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-muted-foreground">Registered Users</h3>
          </CardHeader>
          <CardContent>
            {loadingData ? <Skeleton className="h-10 w-24" /> : <span className="text-2xl font-bold">{userCount}</span>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-muted-foreground">Upcoming Matches</h3>
          </CardHeader>
          <CardContent>
            {loadingData ? <Skeleton className="h-10 w-24" /> : <span className="text-2xl font-bold">{upcomingMatches}</span>}
          </CardContent>
        </Card>
      </div>

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Welcome, {user.displayName || user.email}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the dashboard to manage tournaments, view registered users, and upcoming matches.
          </p>
        </CardContent>
      </Card>

      {/* Graph */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Tournaments per Category</h3>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryStats} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="matches" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
