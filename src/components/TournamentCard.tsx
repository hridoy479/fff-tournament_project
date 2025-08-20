'use client';

import React, { useEffect, useState } from "react";
import Countdown from "react-countdown";
import { Calendar, Clock, Router } from "lucide-react";
import axios from "axios";
import { format } from 'date-fns'; // Import date-fns
import { useRouter } from 'next/navigation'; // Import useRouter
import { auth } from '@/config/firebase'; // Import auth
import { toast } from 'react-toastify'; // Import toast

// Import shadcn/ui components
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

interface Tournament {
  id: number; // Numeric ID for the tournament
  title: string; // The name or title of the tournament
  date: string; // The date and time when the tournament is scheduled
  entry_fee: number; // The cost to enter the tournament
  status: 'upcoming' | 'started' | 'completed' | 'cancelled'; // Current status of the tournament
  image?: string; // URL to the tournament's banner image
  prize?: string; // Description of the prize
  joined_players: number; // Current number of players who have joined
  max_players?: number; // Maximum number of players allowed
  category: string; // The game category
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
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get<{ tournaments: Tournament[] }>('/api/tournaments');
        setTournaments(response.data.tournaments);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filteredTournaments = selectedGame === "All"
    ? tournaments
    : tournaments.filter(t => t.category.toLowerCase().includes(selectedGame.toLowerCase()));

  const totalPages = Math.ceil(filteredTournaments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTournaments = filteredTournaments.slice(startIndex, endIndex);

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
        game_name: category, // Backend expects game_name
      }, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.data.ok) {
        toast.success('Successfully joined tournament!');
        // Optionally, refresh tournament list or update joined_players count
      } else if (response.data.alreadyJoined) {
        toast.info('You have already joined this tournament.');
      } else {
        toast.error(response.data.message || 'Failed to join tournament.');
      }
    } catch (error: any) {
      console.error('Error joining tournament:', error);
      toast.error(error.response?.data?.message || 'Failed to join tournament.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Unauthorized. Please log in again.');
        router.push('/login');
      } else if (error.response?.status === 402) {
        toast.error('Insufficient balance to join this tournament.');
      }
    }
  };

  // Function to handle click and navigate to the details page
  const handleTournamentClick = (tournamentId: number) => {
      router.push(`/tournaments/${tournamentId}`); // Adjust the path as needed
  };

  return (
    <div className="w-full flex flex-col items-center justify-center px-4">
        {fetchError && (
            <div className="text-red-500 mt-4">
                Error loading tournaments. Please try again later.
            </div>
        )}
      {/* Tournament Cards or Skeletons */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {loading
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl shadow-lg w-full bg-white dark:bg-zinc-900 animate-pulse border-2 border-blue-600"
            >
              <div className="rounded-xl w-full h-48 bg-gray-300 dark:bg-zinc-700 mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-2/3 mb-4"></div>
              <div className="w-full h-10 bg-gray-300 dark:bg-zinc-700 rounded-xl"></div>
            </div>
          ))
          : currentTournaments.map((tournament, idx) => {
            const tournamentDate = new Date(tournament.date);
            const formattedDate = format(tournamentDate, 'MMMM dd, yyyy'); // Example: October 26, 2023
            const formattedTime = format(tournamentDate, 'h:mm a');       // Example: 10:30 AM
            const progressPercent = Math.min(
              (tournament.joined_players / tournament.max_players) * 100,
              100
            );

            return (
              <div
                key={startIndex + idx}
                className="p-4 rounded-2xl shadow-lg w-full max-w-sm hover:scale-105 transition items-center justify-center mx-auto mb-6 bg-white dark:bg-zinc-800  hover:shadow-xl cursor-pointer" // Added dark mode bg and hover shadow, and cursor
                onClick={() => handleTournamentClick(tournament.id)} // Add onClick to navigate
              >
                <img
                  src={tournament.image}
                  alt={tournament.title ? `${tournament.title} Tournament` : "Tournament"} // Changed to title
                  className="rounded-xl w-full h-48 object-cover mb-4"
                  loading="lazy"
                />

                <h2 className="text-xl font-bold mb-2">{tournament.title}</h2> 
                <p className="text-sm dark:text-gray-400 mb-4">Hosted by RRR Arena</p>

                <div className="flex justify-between items-center mb-2 text-sm text-gray-800 dark:text-gray-200">
                  <div className="flex flex-col">
                    <span className="font-medium">Entry Fee</span>
                    <span>₹{tournament.entry_fee}</span> 
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-medium">Prize</span>
                    <span>{tournament.prize}</span>
                  </div>
                </div>

                {/* Player Join Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between mb-1 text-sm text-gray-800 dark:text-gray-300">
                    <Label>{tournament.joined_players} Joined</Label>
                    <Label>{tournament.max_players} Max</Label>
                  </div>
                  <Progress
                    value={progressPercent}
                    className="h-2 rounded-full bg-gray-300 dark:bg-zinc-700"
                  />
                </div>

                {/* Date Section */}
                <div className="flex items-center gap-2 text-sm dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm dark:text-gray-300 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{formattedTime}</span>
                </div>

                <button
                  className={`w-full py-2 rounded-xl font-semibold
                    ${progressPercent >= 100
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-purple-500 hover:to-indigo-600 text-white shadow-md hover:shadow-xl transition-shadow" 
                    }`}
                  type="button"
                  disabled={progressPercent >= 100}
                  onClick={() => handleJoinTournament(tournament.id, tournament.category)}
                >
                  {progressPercent >= 100 ? "Tournament Full" : "Join Now"}
                </button>
              </div>
            );
          })}
      </div>

      {/* Pagination Controls - Mobile Friendly */}
      {!loading && (
        <div className="w-full mt-6 overflow-x-auto">
          <div className="flex justify-center items-center gap-2 w-max mx-auto px-2">
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
                  currentPage === i + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
        </div>
      )}
    </div>
  );
};

export default TournamentCard;