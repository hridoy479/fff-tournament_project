'use client';

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import axios from "axios"

type Category = {
  id: number
  title: string
  match: number
  progress: number
  image: string
  color: string
  url: string
}
interface CategoryListProps {
  onSelectGame: (game: string) => void;
}
export function CategoryCard({onSelectGame}:CategoryListProps) {
  const [selectedGame, setSelectedGame] = useState<string>("All");
  const [showList, setShowList] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    axios.get<Category[]>('/gaming.json')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to fetch categories:', err))
  }, [])

  const getColorClass = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-600 text-white"
      case "yellow":
        return "bg-yellow-500 text-black"
      case "blue":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

 

  return (
    <div className="px-4 sm:px-6 lg:px-8 items-center lg:justify-center lg:flex">
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <button
            onClick={() => onSelectGame(category.title)}
            key={category.id}
            className="relative group rounded-xl overflow-hidden transition-all hover:shadow-lg"
            type="button"
          >
            <Card className="w-[300px] h-[120px] relative p-0 border border-gray-200 shadow-md hover:scale-105 transition-transform duration-300">
              <img
                src={category.image || "/placeholder.jpg"}
                alt={category.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute bottom-0 w-full bg-black/60 p-2 md:text-center text-left">
                <h3 className="text-sm font-bold text-white truncate">{category.title}</h3>
                <span className={`text-[11px] px-2 py-[2px] mt-1 inline-block rounded ${getColorClass(category.color)}`}>
                  {category.match} Matches
                </span>
              </div>
            </Card>
          </button>
        ))}
      </div>

      
    </div>
  )
}
