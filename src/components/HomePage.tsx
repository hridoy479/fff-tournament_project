"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AutoCarousel } from "@/components/AutoCarousel";
import { MobileCarousel } from "@/components/MobileCarousel";
import TournamentCardHome from "@/components/TournamentCardHome";
import HomeSlider from "@/components/HomeSlider";
import { motion } from "framer-motion";

 function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground mt-28">
      

      {/* Slider Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center px-4 "
      >
        <div className="w-full max-w-7xl mx-auto ">
          <HomeSlider />
        </div>
        
      </motion.section>

      {/* Category Title Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center py-10 px-4"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          🎮 Explore Game Categories
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Choose your favorite category and join live tournaments.
        </p>
      </motion.section>

      {/* Carousel Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full mb-10 px-4"
      >
        <div className="hidden md:block">
          <AutoCarousel />
        </div>
        <div className="md:hidden">
          <MobileCarousel />
        </div>
      </motion.section>

      {/* Tournaments Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex-grow flex flex-col items-center justify-center px-4 mb-16"
      >
        <h2 className="text-2xl font-semibold mb-6">
          🔥 Live & Upcoming Tournaments
        </h2>
        <div className="flex flex-row gap-x-6 w-full max-w-7xl mx-auto overflow-x-auto">
          <TournamentCardHome />
        </div>
      </motion.section>

      
    </main>
  );
}
export {HomePage};
