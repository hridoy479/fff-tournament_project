'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

interface Slide {
  id: number;
  title: string;
  image: string;
}

export default function HomeSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch('/slider.json')
      .then((res) => res.json())
      .then((data) => {
        setSlides(data);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000)

    return () => clearInterval(interval);
  }, [slides]);

  if (slides.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto relative w-full h-90 overflow-hidden rounded-2xl shadow-md">
      {/* Wrapper with flex and transform */}
      <div
        className="flex h-full transition-transform duration-2300 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative flex-shrink-0 w-full h-full">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover rounded-2xl"
            />
            <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-4 w-full rounded-b-2xl">
              <h2 className="text-lg font-semibold">{slide.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
