// components/CategoryTournamentCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Trophy, CreditCard, Sparkles, Zap, Crown } from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';

interface Tournament {
  _id: string;
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

interface CategoryTournamentCardProps {
  tournament: Tournament;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
  running: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
  finished: 'bg-gradient-to-r from-gray-500 to-slate-600 text-white',
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
    return <div className="text-xl text-center p-2 font-medium text-white ">Starting now!</div>;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center">
          <div className="text-sm font-bold bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[2.5rem] text-center text-white">
            {timeLeft.days}
          </div>
          <span className="text-[10px] text-white/80 mt-1">DAYS</span>
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className="text-sm font-bold bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[2.5rem] text-center text-white">
          {timeLeft.hours.toString().padStart(2, '0')}
        </div>
        <span className="text-[10px] text-white/80 mt-1">HOURS</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-sm font-bold bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[2.5rem] text-center text-white">
          {timeLeft.minutes.toString().padStart(2, '0')}
        </div>
        <span className="text-[10px] text-white/80 mt-1">MINS</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-sm font-bold bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[2.5rem] text-center text-white">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </div>
        <span className="text-[10px] text-white/80 mt-1">SECS</span>
      </div>
    </div>
  );
};

const CategoryTournamentCard: React.FC<CategoryTournamentCardProps> = ({ tournament }) => {
  const tournamentDate = new Date(tournament.date);
  const formattedDate = format(tournamentDate, 'MMM dd, yyyy');
  const formattedTime = format(tournamentDate, 'h:mm a');
  const progressPercent = Math.min(
    (tournament.joined_players / (tournament.max_players || 1)) * 100,
    100
  );

  return (
    <Card className="w-full max-w-md overflow-hidden rounded-2xl border-0 bg-transparent shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:bg-transparent">
      {/* Image section with overlay */}
      <div className="relative h-40 w-full overflow-hidden rounded-t-2xl">
        {tournament.image ? (
          <>
            <img
              src={tournament.image}
              alt={tournament.title}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 via-blue-500 to-teal-400">
            <Trophy className="h-10 w-10 text-white opacity-80" />
          </div>
        )}
        
        {/* Status badge */}
        <Badge 
          className={`absolute top-3 right-3 ${statusColors[tournament.status]} border-0 px-3 py-1 text-xs font-bold flex items-center`}
        >
          {statusIcons[tournament.status]}
          {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
        </Badge>
        
        {/* Tournament title overlay */}
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="text-lg font-bold truncate drop-shadow-md">
            {tournament.title}
          </h3>
          <p className="text-xs font-medium text-white/90 truncate">
            {tournament.category}
          </p>
        </div>
      </div>

      <CardContent className="p-4 bg-white dark:bg-gray-900">
        {/* Date and time */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{formattedTime}</span>
          </div>
        </div>

        {/* Countdown timer for upcoming tournaments */}
        {tournament.status === 'upcoming' && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
            <p className="text-xs font-semibold text-white/90 mb-2 text-center">STARTS IN</p>
            <CountdownTimer targetDate={tournamentDate} />
          </div>
        )}

        {/* Entry fee and prize */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-3 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-1.5">
              <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">₹{tournament.entry_fee}</span>
            <span className="text-xs text-blue-600/80 dark:text-blue-300/80">Entry Fee</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-3 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-100 dark:border-amber-800/30">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 mb-1.5">
              <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-300" />
            </div>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300 truncate w-full text-center">
              {tournament.prize || 'N/A'}
            </span>
            <span className="text-xs text-amber-600/80 dark:text-amber-300/80">Prize Pool</span>
          </div>
        </div>

        {/* Player progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="font-medium">{tournament.joined_players} Joined</span>
            </div>
            {tournament.max_players && (
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                {tournament.max_players} Max
              </span>
            )}
          </div>
          <div className="relative">
            <Progress 
              value={progressPercent} 
              className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full" 
              indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
            <div className="absolute right-0 top-0 text-xs font-bold text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 px-1 rounded-md -translate-y-1/2">
              {Math.round(progressPercent)}%
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 bg-white dark:bg-gray-900 rounded-b-2xl">
        <Button 
          className="w-full text-sm h-10 rounded-xl font-bold transition-all duration-300"
          variant={tournament.status === 'upcoming' ? 'default' : 'outline'}
          size="lg"
          style={
            tournament.status === 'upcoming' 
              ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' } 
              : {}
          }
        >
          {tournament.status === 'upcoming' ? 'Join Now' : 
           tournament.status === 'running' ? 'Join Tournament' : 'View Results'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryTournamentCard;