// src/app/tournaments/category/[categoryName]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import TournamentCard from '@/components/TournamentCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Tournament {
  _id: string;
  id: number;
  title: string;
  date: string;
  image?: string;
  entry_fee: number;
  prize?: string;
  joined_players: number;
  max_players?: number;
  category: string;
  description?: string;
  status: string;
}

export default function CategoryTournamentsPage() {
  const params = useParams();
  const categoryName = params.categoryName as string;
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryName) {
      const fetchTournamentsByCategory = async () => {
        setLoading(true);
        setError(null);
        try {
          // ✅ Use raw categoryName directly
          const response = await axios.get(`/api/tournaments?category=${encodeURIComponent(categoryName)}`);
          setTournaments(response.data.tournaments || []);
        } catch (err: any) {
          console.error(`Failed to fetch tournaments for category ${categoryName}:`, err);
          setError('Failed to load tournaments for this category.');
        } finally {
          setLoading(false);
        }
      };
      fetchTournamentsByCategory();
    }
  }, [categoryName]);

  // Format category name for display
  const formatCategoryName = (name: string) => {
    return decodeURIComponent(name)
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayCategoryName = formatCategoryName(categoryName);

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {displayCategoryName} Tournaments
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore all tournaments in the {displayCategoryName} category.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 mt-8">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && tournaments.length === 0 && (
          <div className="text-center text-muted-foreground mt-8">
            <p>No tournaments found for this category yet.</p>
          </div>
        )}

        {!loading && !error && tournaments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => {
              // Transform the tournament data to match what TournamentCard expects
              const tournamentCardData = {
                _id: tournament._id,
                title: tournament.title,
                date: tournament.date,
                image: tournament.image,
                entry_fee: tournament.entry_fee,
                prize: tournament.prize,
                joined_players: tournament.joined_players,
                max_players: tournament.max_players,
                category: tournament.category,
                description: tournament.description,
                status: tournament.status
              };

              return <TournamentCard key={tournament._id} tournament={tournamentCardData} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
