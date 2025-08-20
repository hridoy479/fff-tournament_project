'use client'
import { CategoryCard } from '@/components/CategoryCard'
import TournamentCard from '@/components/TournamentCard'

import { usePathname } from "next/navigation";

import { useState } from 'react';



function TournamentList() {
   const [selectedGame, setSelectedGame] = useState<string>("All");
   const pathname = usePathname();

  return (
    
    <div className="flex flex-col items-center justify-start min-h-screen">
      {/* HEADER */}


      {/* PAGE CONTENT */}
      <main className="w-full flex flex-col items-center px-4 pt-28 pb-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Welcome to the Tournaments Page</h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 text-center mb-6">
          Here you can find all the latest tournaments and events.
        </p>

        {/* CATEGORY */}
        <div className="w-full max-w-4xl mb-10 items-center justify-center">
          <CategoryCard onSelectGame={setSelectedGame}   />
        </div>

        {/* TOURNAMENT SECTION */}
        <div className="w-full max-w-5xl text-center items-center justify-center dark:bg-gradient-to-b from-zinc-800 to-sky-900 p-6 rounded-lg shadow-lg border-2 dark:border-0 border-gray-700 mb-10">
          <h2 className="text-xl sm:text-2xl font-bold">All Tournament</h2>
          <h3 className="text-lg sm:text-xl font-semibold mt-2">Join Our Tournaments Now!</h3>
          <p className="mt-2 text-base sm:text-lg">
            Compete with players from around the world and win exciting prizes.
          </p>
        </div>

        {/* TOURNAMENT CARDS */}
        <div className="w-full max-w-6xl">
          <TournamentCard selectedGame={selectedGame} />
        </div>
      </main>
    </div>
  );
}


export  {TournamentList};


