'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function RulesComponents() {
  const [isVisible, setIsVisible] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-6xl mx-auto my-12"
      >
        <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm">
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            aria-label="Close rules"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <div className="flex flex-col justify-center space-y-4">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  How to Use Our Platform
                </h2>
                <p className="text-muted-foreground mt-2">
                  Follow these simple steps to get started with tournament competitions
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold mt-0.5">
                    1
                  </div>
                  <p className="text-base">Register or log in to your account</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold mt-0.5">
                    2
                  </div>
                  <p className="text-base">Browse available tournaments and join your favorite one</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold mt-0.5">
                    3
                  </div>
                  <p className="text-base">Follow tournament rules and schedule your matches</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold mt-0.5">
                    4
                  </div>
                  <p className="text-base">Track your progress and climb the leaderboard</p>
                </div>
              </div>

              <Button className="w-fit mt-4">
                Get Started
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </div>

            <div className="relative flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-full aspect-video rounded-xl overflow-hidden shadow-lg border"
              >
                {!isVideoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Play className="h-6 w-6 fill-primary stroke-background" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading tutorial</p>
                    </div>
                  </div>
                )}
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="How to use our platform"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setIsVideoLoaded(true)}
                  loading="lazy"
                />
              </motion.div>
            </div>
          </div>

          {/* Animated border gradient */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/30 via-blue-400/30 to-purple-500/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export default RulesComponents;