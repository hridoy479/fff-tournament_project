'use client';

import { useEffect, useState } from "react";
import axios from "axios";

interface Category {
  title: string;
  category: string;
  match: number;
  color: string;
}

interface CategoryCardProps {
  onSelectGame: (game: string) => void;
}

export function CategoryCard({ onSelectGame }: CategoryCardProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/tournaments", {
          params: { limit: 50, page }
        });
        const tournaments = response.data.tournaments || [];

        const categoryMap: { [key: string]: Category } = {};
        tournaments.forEach((t: any) => {
          if (!categoryMap[t.category]) {
            categoryMap[t.category] = {
              title: t.category.charAt(0).toUpperCase() + t.category.slice(1),
              category: t.category,
              match: 1,
              color: ["freefire", "efootball"].includes(t.category) ? "blue" : "purple",
            };
          } else {
            categoryMap[t.category].match += 1;
          }
        });

        setCategories(Object.values(categoryMap));
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [page]);

  const getGradient = (color: string) => {
    switch (color.toLowerCase()) {
      case "blue":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500";
      case "green":
        return "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-600 hover:to-green-400";
      case "purple":
        return "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500";
      default:
        return "bg-gray-400 hover:bg-gray-500";
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Select a Game Category
      </h2>

      {loading ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 w-40 rounded-xl bg-gray-300 dark:bg-zinc-700 animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {/* All Games Button */}
          <button
            onClick={() => onSelectGame("All")}
            className="relative h-20 w-40 rounded-xl text-white font-semibold shadow-lg transition-transform transform hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 flex flex-col items-center justify-center"
          >
            <span className="text-lg truncate">All Games</span>
            <span className="mt-1 text-sm bg-white/20 px-2 py-1 rounded-full">
              {categories.reduce((acc, cat) => acc + cat.match, 0)} Matches
            </span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => onSelectGame(cat.category)}
              className={`relative h-20 w-40 rounded-xl text-white font-semibold shadow-lg transition-transform transform hover:scale-105 ${getGradient(cat.color)} flex flex-col items-center justify-center`}
            >
              <span className="text-lg truncate">{cat.title}</span>
              <span className="mt-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                {cat.match} Matches
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && categories.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="px-3 py-2 rounded bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200">
            Page {page}
          </span>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
