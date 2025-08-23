'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, Trophy, CreditCard, Sparkles, Zap, Crown } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInSeconds } from "date-fns";

interface Tournament {
  id: string;
  game: string;
  date: string;
  image?: string;
  entry_fee: number;
  prize?: string;
  joined_players: number;
  max_players?: number;
  status: "upcoming" | "running" | "finished";
  game_type?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-gradient-to-r from-blue-500 to-indigo-600',
  running: 'bg-gradient-to-r from-green-500 to-emerald-600',
  finished: 'bg-gradient-to-r from-amber-500 to-orange-600',
};

const statusIcons: Record<string, JSX.Element> = {
  upcoming: <Sparkles className="h-3 w-3 mr-1" />,
  running: <Zap className="h-3 w-3 mr-1" />,
  finished: <Crown className="h-3 w-3 mr-1" />,
};

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
      const difference = differenceInSeconds(targetDate, now);
      
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
    <div className="flex justify-center items-center gap-2">
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

// Skeleton Loader Component
const TournamentCardSkeleton: React.FC = () => {
  return (
    <Card className="max-w-md overflow-hidden rounded-2xl border-0 shadow-lg">
      <div className="relative h-40 w-full bg-gradient-to-br from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="shimmer absolute inset-0" />
      </div>
      
      <CardContent className="p-5 justify-center items-center">
        <div className="flex justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        
        <div className="mb-4 p-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl">
          <Skeleton className="h-4 w-full mb-2" />
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-12 rounded" />
            ))}
          </div>
        </div>
        
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </CardContent>
      
      <CardFooter className="px-5 pb-5 pt-2">
        <Skeleton className="h-11 w-full rounded-xl" />
      </CardFooter>
    </Card>
  );
};

const TournamentCardHome: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [loadingTournament, setLoadingTournament] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    fetch("/api/tournaments")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch tournaments");
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.tournaments ?? [];
        setTournaments(arr);
      })
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  }, []);

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleButtonClick = async (tournament: Tournament) => {
    if (tournament.status === "upcoming") {
      setLoadingTournament(prev => ({ ...prev, [tournament.id]: true }));
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push(`/tournaments/${tournament.id}`);
      setLoadingTournament(prev => ({ ...prev, [tournament.id]: false }));
    } else if (tournament.status === "running") {
      router.push(`/tournaments/${tournament.id}/spectate`);
    } else {
      router.push(`/tournaments/${tournament.id}/results`);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <TournamentCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 gap-6">
      {tournaments.map((tournament) => {
        const tournamentDate = new Date(tournament.date);
        const formattedDate = format(tournamentDate, "MMM dd, yyyy");
        const formattedTime = format(tournamentDate, "h:mm a");
        const progressPercent = Math.min(
          (tournament.joined_players / (tournament.max_players || 1)) * 100,
          100
        );

        const isLoading = loadingTournament[tournament.id] || false;

        return (
          <Card key={tournament.id} className="max-w-md overflow-hidden rounded-2xl border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="relative h-40 w-full">
              {tournament.image && !imageErrors[tournament.id] ? (
                <Image
                  src={tournament.image}
                  alt={tournament.game}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={() => handleImageError(tournament.id)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

              <Badge className={`absolute top-4 right-4 ${statusColors[tournament.status]} border-0 px-3 py-1 text-xs font-bold flex items-center backdrop-blur-sm text-white`}>
                {statusIcons[tournament.status]}
                {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
              </Badge>

              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{tournament.game}</h3>
                {tournament.game_type && (
                  <p className="text-sm text-white/80 mt-1">{tournament.game_type}</p>
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

              {tournament.status === "upcoming" && (
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
                <Progress value={progressPercent} className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full" 
                  indicatorClassName={`rounded-full ${progressPercent >= 90 ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`} 
                />
              </div>
            </CardContent>

            <CardFooter className="px-5 pb-5 pt-2">
              <Button 
                className="w-full text-sm h-11 rounded-xl font-bold transition-all duration-300 flex justify-center items-center gap-2" 
                variant={tournament.status === "upcoming" ? "default" : tournament.status === "running" ? "secondary" : "outline"}
                size="lg"
                onClick={() => handleButtonClick(tournament)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
                  </svg>
                ) : (
                  <>
                    {tournament.status === "upcoming" ? "Join Tournament" : tournament.status === "running" ? "Spectate Now" : "View Results"}
                    {tournament.status === "upcoming" && <Sparkles className="ml-2 h-4 w-4" />}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default TournamentCardHome;