"use client";
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import TournamentCardHome from "@/components/TournamentCardHome";
import HomeSlider from "@/components/HomeSlider";
import { motion } from "framer-motion";
import RulesComponents from "./RulesComponents";
import BeforeFooter from "./BeforeFooter";

interface IAlert {
  id: string;
  message: string;
  isActive: boolean;
  isOpen: boolean; // Added isOpen property
}

function HomePage() {
  const [alerts, setAlerts] = useState<IAlert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/alerts");
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.map((alert: IAlert) => ({ ...alert, isOpen: true }))); // Initialize isOpen
        }
      } catch (error) {
        console.error("Failed to fetch alerts", error);
      }
    };

    fetchAlerts();
  }, []);

  const handleDismiss = (alertId: string) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, isOpen: false } : alert
      )
    );
  };

  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground mt-28">
      <div className="w-full">
        {alerts
          .filter((alert) => alert.isOpen) // Filter by isOpen
          .map((alert) => (
            <AlertDialog open={alert.isOpen} onOpenChange={() => handleDismiss(alert._id)} key={alert.id}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-center font-bold">Notification</AlertDialogTitle>
                  
                  <AlertDialogDescription className="text-center">
                    {alert.message}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => handleDismiss(alert.id)}>Dismiss</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
      </div>

      {/* Slider Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center px-4 "
      >
        <RulesComponents />
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
      <BeforeFooter/>

      
    </main>
  );
}
export {HomePage};
