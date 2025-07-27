'use client';

import { Calendar, Clock, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Countdown from 'react-countdown';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
 // ✅ Ensure this file is aliased properly or use relative path if needed

interface Tournament {
  id: string;
  game: string;
  date: string;
  image: string;
  entry_fee: string;
  prize: string;
  joined_players: number;
  max_players: number;
  description?: string;
}

const TournamentDetails = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await axios.get('/tournament.json');
        const tournamentsData: Tournament[] = response.data;
        const found = tournamentsData.find((t) => t.id === id);
        setTournament(found ?? null);
      } catch (error) {
        setTournament(null);
      }
    };

    fetchTournament();
    return () => {};
    
  }, [id]);

  if (!tournament) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-300">
        Tournament not found.
      </div>
    );
  }

  const dateObj = new Date(tournament.date);
  const progress = Math.min((tournament.joined_players / tournament.max_players) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-zinc-900 shadow-md rounded-2xl p-6 md:p-8">
        <img
          src={tournament.image}
          alt={`${tournament.game} Tournament`}
          className="rounded-xl w-full h-56 object-cover mb-6"
        />

        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          {tournament.game} Tournament
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Hosted by <span className="font-medium text-indigo-600">RRR Arena</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="text-sm">{dateObj.toDateString()}</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <Countdown
              date={dateObj}
              renderer={({ hours, minutes, seconds, completed }) =>
                completed ? (
                  <span className="text-red-500">Started</span>
                ) : (
                  <span className="text-sm">
                    Starts in {hours}h {minutes}m {seconds}s
                  </span>
                )
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm md:text-base mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Prize: {tournament.prize}</span>
          </div>

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-green-600" />
            <span>
              {tournament.joined_players}/{tournament.max_players} players joined
            </span>
          </div>

          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">Entry Fee:</span>
            <span>{tournament.entry_fee}</span>
          </div>
        </div>

        <div className="mb-6">
          <Progress value={progress} className="h-2 rounded-full bg-gray-300 dark:bg-zinc-700" />
        </div>

        {tournament.description && (
          <p className="mb-6 text-gray-600 dark:text-gray-400">{tournament.description}</p>
        )}

        <Button
          className={`w-full text-white py-2 text-base font-semibold ${
            progress >= 100
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
          disabled={progress >= 100}
        >
          {progress >= 100 ? 'Tournament Full' : 'Join Tournament'}
        </Button>
      </div>
    </div>
  );
};

export default TournamentDetails;
