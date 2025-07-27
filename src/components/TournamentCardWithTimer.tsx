'use client';

import { useEffect, useState } from 'react';

interface Props {
  title: string;
  countdown: string; // ISO string from backend
}

const TournamentCardWithTimer = ({ title, countdown }: Props) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(countdown).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft("Starting Soon!");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  return (
    <div className="bg-card text-card-foreground shadow-md rounded-xl p-5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">Prepare your squad & get ready!</p>
      </div>
      <div className="mt-auto">
        <p className="text-sm font-medium text-white">⏱ Starts In:</p>
        <p className="text-lg font-semibold text-green-400">{timeLeft}</p>
      </div>
    </div>
  );
};

export default TournamentCardWithTimer;
