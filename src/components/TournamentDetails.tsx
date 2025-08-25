'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { Calendar, Clock, Trophy, Users, Copy, Check } from 'lucide-react'; // ✅ added Copy + Check
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';

const Countdown = dynamic(() => import('react-countdown').then((m) => m.default), { ssr: false });
import JoinTournament from './JoinTournament';
import { PlayerDataTable, columns } from './PlayerDataTable';

interface Player {
  uid: string;
  user_uid: string;
  tournament_id: number;
  game_name: string;
  createdAt: string;
}

interface Tournament {
  id: number;
  title: string;
  date: string;
  entry_fee: number;
  status: 'upcoming' | 'started' | 'completed' | 'cancelled';
  image?: string;
  prize?: string;
  joined_players: number;
  max_players?: number;
  category: string;
  match_id?: string;
  description?: string;
}

interface CountdownRendererProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}

// Custom Countdown Renderer Component
const CountdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRendererProps) => {
  if (completed) {
    return <span className="text-red-500 font-semibold">Started</span>;
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-gray-800 dark:bg-gray-700 text-white rounded-lg p-2 min-w-[50px] text-center relative overflow-hidden">
        <div className="text-xl font-bold font-mono">{value.toString().padStart(2, '0')}</div>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
      </div>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center space-x-2">
      {days > 0 && (
        <>
          <TimeBlock value={days} label="Days" />
          <span className="text-gray-400">:</span>
        </>
      )}
      <TimeBlock value={hours} label="Hours" />
      <span className="text-gray-400">:</span>
      <TimeBlock value={minutes} label="Minutes" />
      <span className="text-gray-400">:</span>
      <TimeBlock value={seconds} label="Seconds" />
    </div>
  );
};

const TournamentDetails = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [copied, setCopied] = useState(false); // ✅ hook declared once at top

  const handleCopy = () => {
    if (!tournament?.match_id) return;
    navigator.clipboard.writeText(tournament.match_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const numericId =
          typeof id === 'string'
            ? parseInt(id, 10)
            : Array.isArray(id)
            ? parseInt(id[0], 10)
            : NaN;

        if (isNaN(numericId)) {
          setTournament(null);
          setLoading(false);
          return;
        }

        const [tournamentResponse, playersResponse] = await Promise.all([
          axios.get<{ tournament: Tournament }>(`/api/tournaments/${numericId}`),
          axios.get<{ players: Player[] }>(`/api/tournaments/${numericId}/players`),
        ]);

        setTournament(tournamentResponse.data.tournament);
        setPlayers(playersResponse.data.players);
      } catch (error) {
        console.error('Error fetching tournament details or players:', error);
        toast.error('Failed to load tournament details or players.');
        setTournament(null);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        Loading tournament details...
      </div>
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
    'Free Fire': [
      '5v5 Competitive format.',
      'No cheating, scripting, or third-party tools.',
      'Map pool follows standard maps.',
      'Admins have final decision in disputes.',
    ],
    'Ludo': [
      'Follow standard Ludo rules.',
      'No coaching during gameplay.',
      'Use of exploits/bugs is prohibited.',
      'Ping limit may apply for fair play.',
    ],
    'E Football': [
      'Play in third-person perspective unless stated.',
      'No teaming outside your squad.',
      'No stream sniping or ghosting.',
      'Follow timing and drop rules set by admins.',
    ],
  };

  const rules = rulesByGame[tournament.category] ?? [
    'Play fair, no cheating.',
    'Respect other players and admins.',
    'Provide valid proof if disputes arise.',
    'Admins reserve final decision rights.',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl overflow-hidden">
        {/* Banner Image */}
        <div className="relative w-full h-64 md:h-80">
          <Image
            src={tournament.image || '/default-tournament.jpg'}
            alt={`${tournament.title} banner`}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <h1 className="text-2xl md:text-4xl font-bold">{tournament.title}</h1>
            <p className="text-sm text-gray-200">Hosted by RRR Arena</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Date */}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span className="text-sm">{dateObj.toDateString()}</span>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-500" />
              <Countdown date={dateObj} renderer={CountdownRenderer} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm md:text-base mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Prize: {tournament.prize || 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Entry Fee:</span>
              <span>{tournament.entry_fee}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <span>
                {tournament.joined_players}/{tournament.max_players ?? '∞'} Players
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span className="capitalize">{tournament.status}</span>
            </div>
          </div>

          {/* Description */}
          {tournament.description && (
            <p className="mb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
              {tournament.description}
            </p>
          )}

          {/* Match ID Button */}
          <div className="flex items-center gap-3 mb-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Match ID</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Match ID</DialogTitle>
                  <DialogDescription className="flex items-center justify-between p-3 rounded bg-gray-100 dark:bg-gray-800">
                    {tournament.match_id ? (
                      <>
                        <span className="font-mono text-sm">{tournament.match_id}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopy}
                          className={copied ? "text-green-500" : "text-gray-600"}
                        >
                          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Match ID will be provided 5 minutes before start.
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>

          {/* Join Tournament */}
          <JoinTournament tournamentId={tournament.id} entryFee={tournament.entry_fee} />

          {/* Rules */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Rules</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              {rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>

          {/* Joined Players Table */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Joined Players</h3>
            <PlayerDataTable columns={columns} data={players} />
          </div>
        </div>
      </div>

      {/* Add shine animation to CSS */}
      <style jsx>{`
        @keyframes shine {
          to {
            transform: translateX(100%);
          }
        }
        .animate-shine {
          animation: shine 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default TournamentDetails;
