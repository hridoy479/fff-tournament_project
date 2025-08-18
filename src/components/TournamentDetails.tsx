'use client';

import { Calendar, Clock, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
// ✅ Ensure this file is aliased properly or use relative path if needed

const Countdown = dynamic(() => import('react-countdown').then((m) => m.default), { ssr: false });
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import JoinTournament from './JoinTournament';

interface Tournament {
  id: number;
  game: string;
  date: string;
  image: string;
  entry_fee: number;
  prize: number;
  description?: string;
}

const TournamentDetails = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await fetch('/tournaments.json');
        if (!res.ok) throw new Error('Failed to load tournaments');
        const tournamentsData = (await res.json()) as Tournament[];
        const numericId = typeof id === 'string' ? parseInt(id, 10) : Array.isArray(id) ? parseInt(id[0], 10) : NaN;
        const found = tournamentsData.find((t) => t.id === numericId) ?? null;
        setTournament(found);
      } catch {
        setTournament(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
    return () => {};
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">Loading...</div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-300">
        Tournament not found.
      </div>
    );
  }

  const dateObj = new Date(tournament.date);
  const rulesByGame: Record<string, string[]> = {
    'CS:GO': [
      '5v5 Competitive format.',
      'No cheating, scripting, or third-party tools.',
      'Map pool follows standard Active Duty maps.',
      'Admins have final decision in disputes.'
    ],
    'Valorant': [
      '5v5 standard rules.',
      'Coaching outside tactical timeouts is not allowed.',
      'Use of exploits/bugs is prohibited.',
      'Ping limit may apply for fair play.'
    ],
    'PUBG': [
      'Third-person perspective unless stated otherwise.',
      'No teaming outside your squad.',
      'No stream sniping or ghosting.',
      'Follow circle timing and drop rules shared by admins.'
    ],
    'Dota 2': [
      'Captains Mode unless stated otherwise.',
      'Use only allowed heroes and cosmetics.',
      'Pauses require valid reason and time cap.',
      'Unsportsmanlike behavior leads to disqualification.'
    ],
    'Apex Legends': [
      'Trios or Duos as announced.',
      'No glitch or exploit usage.',
      'Respect lobby rehost instructions.',
      'Kills and placement points determine standings.'
    ],
    'Call of Duty': [
      'Standard CDL-style rules unless stated.',
      'Banned items follow admin list.',
      'Players must record gameplay when requested.',
      'Toxic behavior may incur penalties.'
    ]
  };
  const rules = rulesByGame[tournament.game] ?? [
    'Follow fair play; cheating is prohibited.',
    'Be respectful to other players and admins.',
    'Provide valid screenshots/recordings if disputes arise.',
    'Admins reserve the right to final decisions.'
  ];
    
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-zinc-900 shadow-md rounded-2xl p-6 md:p-8">
        <div className="relative w-full h-56 mb-6">
          <Image
            src={tournament.image}
            alt={`${tournament.game} Tournament`}
            fill
            sizes="100vw"
            className="rounded-xl object-cover"
          />
        </div>

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

          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">Entry Fee:</span>
            <span>{tournament.entry_fee}</span>
          </div>
        </div>

        {tournament.description && (
          <p className="mb-6 text-gray-600 dark:text-gray-400">{tournament.description}</p>
        )}

        <div className="flex items-center gap-3 mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Match ID</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Match ID will be provided 5 minutes before start.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <JoinTournament tournamentId={tournament.id} entryFee={tournament.entry_fee} />

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Rules</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            {rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default TournamentDetails;
