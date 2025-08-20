'use client';

import React, { useEffect, useState, useMemo } from "react";
import { Calendar, Clock } from "lucide-react";
import axios from "axios";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { auth } from '@/config/firebase';
import { toast } from 'react-toastify';

import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

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
}

const ITEMS_PER_PAGE = 6;

interface TournamentCardProps {
  selectedGame: string;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ selectedGame }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchError, setFetchError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get<{ tournaments: Tournament[] }>('/api/tournaments');
        setTournaments(response.data.tournaments || []);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filteredTournaments = useMemo(() => {
    if (selectedGame === "All") return tournaments;
    return tournaments.filter(t => t.category?.toLowerCase().includes(selectedGame.toLowerCase()));
  }, [tournaments, selectedGame]);

  const totalPages = Math.ceil(filteredTournaments.length / ITEMS_PER_PAGE);
  const currentTournaments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTournaments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTournaments, currentPage]);

  const handleJoinTournament = async (tournamentId: number, category: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error('You must be logged in to join a tournament.');
      router.push('/login');
      return;
    }
    try {
      const idToken = await currentUser.getIdToken();
      const response = await axios.post('/api/tournaments/join', {
        tournament_id: tournamentId,
        game_name: category,
      }, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (response.data.ok) toast.success('Successfully joined tournament!');
      else if (response.data.alreadyJoined) toast.info('You have already joined this tournament.');
      else toast.error(response.data.message || 'Failed to join tournament.');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to join tournament.');
      if ([401, 403].includes(error.response?.status)) router.push('/login');
      else if (error.response?.status === 402) toast.error('Insufficient balance to join this tournament.');
    }
  };

  const handleTournamentClick = (tournamentId: number) => {
    router.push(`/tournaments/${tournamentId}`);
  };

  const renderSkeleton = () => (
    <div className="p-4 rounded-2xl shadow-lg w-full max-w-sm bg-white dark:bg-zinc-900 animate-pulse border-2 border-blue-600">
      <div className="rounded-xl w-full h-48 bg-gray-300 dark:bg-zinc-700 mb-4"></div>
      <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-1/2 mb-4"></div>
      <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-1/3 mb-2"></div>
      <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-2/3 mb-4"></div>
      <div className="w-full h-10 bg-gray-300 dark:bg-zinc-700 rounded-xl"></div>
    </div>
  );

  const TournamentItem: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
    const tournamentDate = new Date(tournament.date);
    const formattedDate = format(tournamentDate, 'MMMM dd, yyyy');
    const formattedTime = format(tournamentDate, 'h:mm a');
    const progressPercent = Math.min((tournament.joined_players / (tournament.max_players || 1)) * 100, 100);

    return (
      <div
        className="p-4 rounded-2xl shadow-lg w-full max-w-sm hover:scale-105 transition cursor-pointer mx-auto mb-6 bg-white dark:bg-zinc-800 hover:shadow-xl"
        onClick={() => handleTournamentClick(tournament.id)}
      >
        {tournament.image && (
          <img
            src={tournament.image}
            alt={`${tournament.title} Tournament`}
            className="rounded-xl w-full h-48 object-cover mb-4"
            loading="lazy"
          />
        )}

        <h2 className="text-xl font-bold mb-2">{tournament.title}</h2>
        <p className="text-sm dark:text-gray-400 mb-4">Hosted by RRR Arena</p>

        <div className="flex justify-between items-center mb-2 text-sm dark:text-gray-200">
          <div>
            <span className="font-medium">Entry Fee: </span>₹{tournament.entry_fee}
          </div>
          <div>
            <span className="font-medium">Prize: </span>{tournament.prize || 'N/A'}
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between mb-1 text-sm dark:text-gray-300">
            <Label>{tournament.joined_players} Joined</Label>
            <Label>{tournament.max_players || '∞'} Max</Label>
          </div>
          <Progress value={progressPercent} className="h-2 rounded-full bg-gray-300 dark:bg-zinc-700" />
        </div>

        <div className="flex items-center gap-2 text-sm dark:text-gray-300 mb-2">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm dark:text-gray-300 mb-4">
          <Clock className="w-4 h-4" />
          <span>{formattedTime}</span>
        </div>

        <button
          className={`w-full py-2 rounded-xl font-semibold ${
            progressPercent >= 100
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-purple-500 hover:to-indigo-600 text-white shadow-md hover:shadow-xl transition-shadow"
          }`}
          disabled={progressPercent >= 100}
          onClick={(e) => {
            e.stopPropagation();
            handleJoinTournament(tournament.id, tournament.category);
          }}
        >
          {progressPercent >= 100 ? "Tournament Full" : "Join Now"}
        </button>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center px-4">
      {fetchError && <div className="text-red-500 mt-4">Error loading tournaments. Please try again later.</div>}

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>)
          : currentTournaments.map((t) => <TournamentItem key={t.id} tournament={t} />)}
      </div>

      {!loading && totalPages > 1 && (
        <div className="w-full mt-6 flex justify-center gap-2 overflow-x-auto">
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded whitespace-nowrap ${
                currentPage === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TournamentCard;
