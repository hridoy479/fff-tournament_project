"use client"
import * as React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

type Product = {
  id: number
  title: string
  image: string
}

export function MobileCarousel() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/gaming.json') 
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(data => {
        setItems(data) 
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="flex justify-center items-center">Loading...</div>
  if (error) return (
    <div className="flex justify-center items-center">
      <p>Error: {error}</p>
      <button onClick={() => window.location.reload()} className="ml-2 p-2 bg-blue-500 text-white rounded">Retry</button>
    </div>
  )

  return (
    <div className="overflow-y-auto flex flex-col space-y-4 max-h-[80vh]">
      {items.map((item) => (
        <Card key={item.id} className="w-full">
          <CardContent className="flex items-center justify-center p-0 h-48">
            <img 
              src={item.image} 
              alt={item.title} 
              className="object-cover w-full h-full rounded-xl cursor-pointer hover:scale-110 transition-transform duration-300" 
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
