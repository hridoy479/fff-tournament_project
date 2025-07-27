"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Gamepad2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Tournament {
  game: string;
  date: string;
  image: string;
}

const tournaments: Tournament[] = [
  {
    game: "Call of Duty",
    date: "July 28, 2025",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/header.jpg",
  },
  {
    game: "CS:GO",
    date: "August 1, 2025",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
  },
  {
    game: "PUBG",
    date: "August 10, 2025",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg",
  },
];

// Skeleton Card Component
function SkeletonTournamentCard() {
  return (
    <Card className="w-[300px] shadow-md rounded-xl animate-pulse">
      <CardContent className="p-0">
        <div className="rounded-t-xl w-full h-[160px] bg-gray-300 dark:bg-gray-700" />
        <div className="p-4 space-y-3 bg-white dark:bg-black">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
          </div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function UpcomingTournaments() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-12 px-4 text-center">
      <h2 className="text-2xl font-bold mb-6 dark:text-white stylish-text ">🔥 Upcoming Tournaments</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {loading
          ? [1, 2, 3].map((i) => <SkeletonTournamentCard key={i} />)
          : tournaments.map((t, i) => (
              <Card
                key={i}
                className="w-[300px] shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl"
              >
                <CardContent className="p-0">
                  <img
                    src={t.image}
                    alt={t.game}
                    className="rounded-t-xl w-full h-[160px] object-cover"
                  />
                  <div className="p-4 space-y-2 text-left bg-white dark:bg-black">
                    <h3 className="text-xl font-semibold dark:text-white">{t.game}</h3>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                      <CalendarDays className="w-4 h-4" />
                      <span>{t.date}</span>
                    </div>
                    <Button className="mt-2 w-full">
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      Register
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </section>
  );
}