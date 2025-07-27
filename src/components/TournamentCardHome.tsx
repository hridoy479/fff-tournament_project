'use client';

import React, { useEffect, useState } from "react";
import Countdown from "react-countdown";
import { Calendar, Clock } from "lucide-react";
import axios from "axios";

interface Tournament {
  game: string;
  date: string;
  image: string;
}

const ITEMS_PER_PAGE = 6;

const TournamentCardHome= () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    axios.get<Tournament[]>('/tournaments.json')
      .then((res) => setTournaments(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading tournaments...</div>;
  }

  // Pagination logic
  const totalPages = Math.ceil(tournaments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTournaments = tournaments.slice(startIndex, endIndex);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Tournament Cards */}
      <div className="w-full flex flex-wrap justify-center">
        {currentTournaments.map((tournament, idx) => {
          const tournamentDate = new Date(tournament.date);

          return (
            <div
              key={startIndex + idx}
              className="p-4 rounded-2xl shadow-lg w-full max-w-sm hover:scale-105 transition items-center justify-center mx-auto mb-6"
            >
              <img
                src={tournament.image}
                alt={tournament.game ? `${tournament.game} Tournament` : "Tournament"}
                className="rounded-xl w-full h-48 object-cover mb-4"
                loading="lazy"
              />

              <h2 className="text-xl font-bold mb-2">{tournament.game} Tournament</h2>
              <p className="text-sm text-gray-400 mb-4">Hosted by RRR Arena</p>

              <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                <Calendar className="w-4 h-4" />
                <span>{tournamentDate.toDateString()}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                <Clock className="w-4 h-4" />
                <Countdown
                  date={tournamentDate}
                  daysInHours={true}
                  renderer={({ hours, minutes, seconds, completed }) =>
                    completed ? (
                      <span className="text-red-500">Tournament Started!</span>
                    ) : (
                      <span>
                        Starts in: {hours}h {minutes}m {seconds}s
                      </span>
                    )
                  }
                />
              </div>

              <button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-semibold"
                type="button"
              >
                Join Now
              </button>
            </div>
          );
        })}
      </div>

      </div>
  );
};

export default TournamentCardHome;