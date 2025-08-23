'use client';

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Calendar, Clock, Users, Trophy, CreditCard, Sparkles, Zap, Crown } from "lucide-react";
import { useRouter } from 'next/navigation';
import axios from "axios";
import { format } from 'date-fns';
import { auth } from '@/config/firebase';
import { toast } from 'react-toastify';

import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const statusMap: Record<string, string> = {
  upcoming: 'upcoming',
  started: 'running',
  completed: 'finished',
  cancelled: 'cancelled'
};

const statusColors: Record<string, string> = {
  upcoming: 'bg-gradient-to-r from-blue-500 to-indigo-600',
  running: 'bg-gradient-to-r from-green-500 to-emerald-600',
  finished: 'bg-gradient-to-r from-amber-500 to-orange-600',
  cancelled: 'bg-gradient-to-r from-red-500 to-rose-600'
};

const statusIcons: Record<string, JSX.Element> = {
  upcoming: <Sparkles className="h-3 w-3 mr-1" />,
  running: <Zap className="h-3 w-3 mr-1" />,
  finished: <Crown className="h-3 w-3 mr-1" />,
  cancelled: <Crown className="h-3 w-3 mr-1" />
};

const ITEMS_PER_PAGE = 6;

interface TournamentCardProps {
  selectedGame: string;
}

const CountdownTimer: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = Math.max(0, (targetDate.getTime() - now.getTime()) / 1000);
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (60 * 60 * 24)),
          hours: Math.floor((difference % (60 * 60 * 24)) / (60 * 60)),
          minutes: Math.floor((difference % (60 * 60)) / 60),
          seconds: Math.floor(difference % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.days + timeLeft.hours + timeLeft.minutes + timeLeft.seconds <= 0) {
    return (
      <div className="text-center font-medium text-white py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
        Starting now!
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-2">
      {timeLeft.days > 0 && (
        <div className="bg-white/10 rounded p-2 min-w-[50px] text-center">
          <div className="text-lg font-bold text-white">{timeLeft.days}</div>
          <div className="text-xs text-white/80">Days</div>
        </div>
      )}
      <div className="bg-white/10 rounded p-2 min-w-[50px] text-center">
        <div className="text-lg font-bold text-white">{timeLeft.hours.toString().padStart(2, '0')}</div>
        <div className="text-xs text-white/80">Hours</div>
      </div>
      <div className="bg-white/10 rounded p-2 min-w-[50px] text-center">
        <div className="text-lg font-bold text-white">{timeLeft.minutes.toString().padStart(2, '0')}</div>
        <div className="text-xs text-white/80">Mins</div>
      </div>
      <div className="bg-white/10 rounded p-2 min-w-[50px] text-center">
        <div className="text-lg font-bold text-white">{timeLeft.seconds.toString().padStart(2, '0')}</div>
        <div className="text-xs text-white/80">Secs</div>
      </div>
    </div>
  );
};

const TournamentCardSkeleton: React.FC = () => {
  return (
    <Card className="max-w-md overflow-hidden rounded-2xl border-0 shadow-lg">
      <div className="relative h-40 w-full bg-gradient-to-br from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="shimmer absolute inset-0" />
      </div>
      
      <CardContent className="p-5">
        <div className="flex justify-between mb-4">
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
        
        <div className="mb-4 p-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl">
          <div className="h-4 w-full bg-gray-300 dark:bg-gray-600 rounded mb-2" />
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
            ))}
          </div>
        </div>
        
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded-xl" />
          <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded-xl" />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-2 w-full bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>
      </CardContent>
      
      <CardFooter className="px-5 pb-5 pt-2">
        <div className="h-11 w-full bg-gray-300 dark:bg-gray-700 rounded-xl" />
      </CardFooter>
    </Card>
  );
};

const TournamentItem: React.FC<{ 
  tournament: Tournament;
  onJoinTournament: (tournamentId: number, category: string) => Promise<void>;
}> = ({ tournament, onJoinTournament }) => {
  const [imageError, setImageError] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();
  
  const tournamentDate = new Date(tournament.date);
  const formattedDate = format(tournamentDate, 'MMMM dd, yyyy');
  const formattedTime = format(tournamentDate, 'h:mm a');
  const progressPercent = Math.min((tournament.joined_players / (tournament.max_players || 1)) * 100, 100);
  const mappedStatus = statusMap[tournament.status] || tournament.status;
  
  const handleJoinClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsJoining(true);
    await onJoinTournament(tournament.id, tournament.category);
    setIsJoining(false);
  };

  return (
    <Card 
      className="max-w-md overflow-hidden rounded-2xl border-0 shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer"
      onClick={() => router.push(`/tournaments/${tournament.id}`)}
    >
      <div className="relative h-40 w-full">
        {tournament.image && !imageError ? (
          <Image
            src={tournament.image}
            alt={tournament.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <Trophy className="h-10 w-10 text-white" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <Badge className={`absolute top-4 right-4 ${statusColors[mappedStatus]} border-0 px-3 py-1 text-xs font-bold flex items-center backdrop-blur-sm text-white`}>
          {statusIcons[mappedStatus]}
          {mappedStatus.charAt(0).toUpperCase() + mappedStatus.slice(1)}
        </Badge>

        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold">{tournament.title}</h3>
          {tournament.category && (
            <p className="text-sm text-white/80 mt-1">{tournament.category}</p>
          )}
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {mappedStatus === "upcoming" && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
            <p className="text-xs font-semibold text-white/90 mb-2 text-center">TOURNAMENT STARTS IN</p>
            <CountdownTimer targetDate={tournamentDate} />
          </div>
        )}

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center rounded-xl bg-blue-50 p-3 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-800/30">
            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-1.5" />
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">₹{tournament.entry_fee}</span>
            <span className="text-xs text-blue-600/80 dark:text-blue-400/80">Entry Fee</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-amber-50 p-3 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-800/30">
            <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400 mb-1.5" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{tournament.prize || "N/A"}</span>
            <span className="text-xs text-amber-600/80 dark:text-amber-400/80">Prize Pool</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4 text-purple-500" />
              <span>{tournament.joined_players} Joined</span>
            </div>
            {tournament.max_players && (
              <span className="text-muted-foreground">{tournament.max_players} Max</span>
            )}
          </div>
          <Progress 
            value={progressPercent} 
            className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full" 
            indicatorClassName={`rounded-full ${progressPercent >= 90 ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`} 
          />
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-2">
        <Button 
          className="w-full text-sm h-11 rounded-xl font-bold transition-all duration-300" 
          onClick={handleJoinClick}
          disabled={progressPercent >= 100 || isJoining || mappedStatus !== "upcoming"}
        >
          {isJoining ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Joining...
            </div>
          ) : progressPercent >= 100 ? (
            "Tournament Full"
          ) : mappedStatus !== "upcoming" ? (
            "View Tournament"
          ) : (
            "Join Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

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
        toast.error("Failed to load tournaments");
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

      if (response.data.ok) {
        toast.success('Successfully joined tournament!');
        // Update the tournament list to reflect the new join
        setTournaments(prev => prev.map(t => 
          t.id === tournamentId 
            ? { ...t, joined_players: t.joined_players + 1 } 
            : t
        ));
      } else if (response.data.alreadyJoined) {
        toast.info('You have already joined this tournament.');
      } else {
        toast.error(response.data.message || 'Failed to join tournament.');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to join tournament.');
      if ([401, 403].includes(error.response?.status)) {
        router.push('/login');
      } else if (error.response?.status === 402) {
        toast.error('Insufficient balance to join this tournament.');
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center px-4">
      {fetchError && (
        <div className="text-red-500 mt-4 text-center p-4 bg-red-50 rounded-lg">
          Error loading tournaments. Please try again later.
        </div>
      )}

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <TournamentCardSkeleton key={i} />
            ))
          : currentTournaments.map((t) => (
              <TournamentItem 
                key={t.id} 
                tournament={t} 
                onJoinTournament={handleJoinTournament}
              />
            ))
        }
      </div>

      {!loading && filteredTournaments.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold">No tournaments found</h3>
          <p className="mt-2">There are no tournaments matching your criteria.</p>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="w-full mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default TournamentCard;