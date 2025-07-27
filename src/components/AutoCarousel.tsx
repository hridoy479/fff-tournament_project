'use client';
import * as React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type Product = {
  id: number
  title: string
  image: string
}

function SkeletonCard() {
  return (
    <div className="p-2 animate-pulse">
      <Card>
        <CardContent className="flex items-center justify-center p-0 h-48">
          <div className="w-full h-full bg-gray-300 rounded-xl" />
        </CardContent>
        <div className="mt-2 h-4 bg-gray-300 rounded w-3/4 mx-auto" />
      </Card>
    </div>
  )
}

export function AutoCarousel() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios.get<Product[]>('/gaming.json')
      .then(res => {
        setItems(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    // Show 2 skeleton cards (adjust as needed)
    return (
      <Carousel className="w-full max-w-4xl mx-auto">
        <CarouselContent className="-ml-1">
          {[1, 2,3].map((i) => (
            <CarouselItem key={i} className="pl-1 basis-full md:basis-1/2 lg:basis-1/2">
              <SkeletonCard />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    )
  }

  if (error) return <p>Error: {error}</p>

  return (
    <Carousel className="w-full max-w-6xl mx-auto">
      <CarouselContent className="-ml-1">
        {items.map((item) => (
          <CarouselItem key={item.id} className="pl-1 basis-full md:basis-1/2 lg:basis-1/3">
            <div className="p-2">
              <Card>
                <CardContent className="flex items-center justify-center p-0 h-48">
                  <img src={item.image} alt={item.title} className="object-cover w-full h-full rounded-xl cursor-pointer hover:scale-120" />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}