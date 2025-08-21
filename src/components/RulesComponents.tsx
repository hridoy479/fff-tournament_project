'use client';
import { useState } from 'react';
import { X, Play, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function RulesComponents() {
  const [isVisible, setIsVisible] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="relative w-full max-w-3xl mx-auto my-6 px-3">
      <Card className="relative border shadow-md rounded-2xl">
        {/* Close Button */}
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader>
          <CardTitle className="text-xl font-bold text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            How to Get Started
          </CardTitle>
          <CardDescription className="text-center text-sm text-muted-foreground">
            Quick steps to join and play in tournaments
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-2">
          {/* Steps */}
          <div className="space-y-3 text-sm">
            {[
              'Register or log in to your account',
              'Browse available tournaments and join',
              'Follow tournament rules & play matches',
              'Track progress and climb the leaderboard',
            ].map((step, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold mt-0.5">
                  {idx + 1}
                </div>
                <p>{step}</p>
              </div>
            ))}

            <Button size="sm" className="mt-3 w-full sm:w-auto">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Video */}
          <div className="relative rounded-lg overflow-hidden shadow border aspect-video">
            {!isVideoLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <Play className="h-5 w-5 fill-primary stroke-background" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Loading tutorial…
                </p>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RulesComponents;
