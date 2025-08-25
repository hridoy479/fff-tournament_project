'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { TournamentResultsTable } from '@/components/TournamentResultsTable';

interface TournamentResult {
  game_name: string;
  rank: number;
  score: number;
  // Add other relevant fields for results
}

export default function TournamentResultsPage() {
  const { id } = useParams();
  const [results, setResults] = useState<TournamentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const numericId =
          typeof id === 'string'
            ? parseInt(id, 10)
            : Array.isArray(id)
            ? parseInt(id[0], 10)
            : NaN;

        if (isNaN(numericId)) {
          setError('Invalid tournament ID.');
          setLoading(false);
          return;
        }

        const response = await axios.get<{ results: TournamentResult[] }>(`/api/tournaments/${numericId}/results`);
        setResults(response.data.results);
      } catch (err: Error) {
        console.error('Error fetching tournament results:', err);
        setError(err.message || 'Failed to load tournament results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 pt-20">
        <Card>
          <CardHeader>
            <CardTitle>Tournament Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 pt-20">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pt-20">
      <h1 className="text-3xl font-bold mb-6">Tournament Results</h1>
      {results.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Results Yet</AlertTitle>
          <AlertDescription>Results for this tournament are not available yet.</AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <TournamentResultsTable data={results} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
