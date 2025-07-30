import React from 'react'
import { FaMobileAlt, FaTelegramPlane } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function BeforeFooter() {
    return (
        <div className="relative max-w-3xl mx-auto mt-20 px-4">
            {/* Floating Card with Glassmorphism */}
            <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-900/80 via-blue-700/70 to-blue-900/80 text-white rounded-[2.5rem] shadow-2xl border-0 overflow-visible ring-4 ring-blue-700/20">
            <CardHeader className="flex flex-col items-center pt-12 pb-6 relative">
            {/* Animated Free Fire Icon (Flame + Gamepad) */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                <span className="text-6xl animate-spin-slow drop-shadow-lg">🔥</span>
                <span className="text-5xl animate-bounce drop-shadow-lg">🎮</span>
            </div>
            <CardTitle className="text-5xl font-black tracking-tight drop-shadow-lg bg-gradient-to-r from-blue-300 via-blue-400 to-blue-400 bg-clip-text text-transparent">
                Free Fire Battle Royale
            </CardTitle>
            <span className="text-blue-200 text-lg font-mono tracking-widest uppercase mt-2">
                Powered by FFF Tournament
            </span>
            </CardHeader>
            <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Live Video with Neon Border */}
            <div className="relative w-full md:w-2/3 aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-400/60 neon-glow mb-6 md:mb-0">
                <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Free Fire Live"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                ></iframe>
                {/* Neon Glow Effect */}
                <div className="absolute inset-0 pointer-events-none rounded-3xl border-4 border-blue-400/40 animate-pulse"></div>
            </div>
            {/* Scoreboard Card */}
            <div className="bg-gradient-to-br from-white/10 via-blue-900/40 to-white/10 rounded-2xl p-8 flex flex-col items-center shadow-inner border border-blue-700/30 w-full md:w-1/3 glass-card">
                <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-blue-400 drop-shadow">Squad Alpha</span>
                <span className="text-xl font-mono text-blue-200">vs</span>
                <span className="text-2xl font-bold text-blue-300 drop-shadow">Squad Bravo</span>
                </div>
                <div className="flex items-center gap-2 text-2xl font-mono mb-2">
                <span className="text-white">Kills:</span>
                <span className="font-extrabold text-green-400 animate-bounce">18</span>
                <span className="text-blue-200 text-lg">(Zone 4)</span>
                </div>
                <div className="text-base text-blue-100 italic">
                <span className="font-semibold text-blue-300">Live:</span> Alpha needs <span className="font-bold text-green-300">2 more kills</span> to lead
                </div>
            </div>
            </div>
            </CardContent>
            </Card>
            {/* Floating Action Buttons with Parallax Effect */}
            <div className="flex flex-col md:flex-row w-full justify-center items-center gap-8 py-8 mt-8 bg-gradient-to-r from-blue-900/80 via-blue-700/80 to-blue-900/80 rounded-2xl shadow-xl relative overflow-visible">
            <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="transform hover:-translate-y-2 transition-transform duration-300"
            >
            <Button
                size="lg"
                className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white text-lg font-bold px-10 py-6 rounded-xl flex items-center gap-4 shadow-2xl transition-all duration-200 border-2 border-blue-300/40"
            >
                {/* Play Store Icon SVG */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="text-3xl animate-pulse"
                    width={32}
                    height={32}
                    fill="currentColor"
                >
                    <path d="M325.3 234.3 104.7 13.7C97.1 6.1 85.7 4.4 76.1 9.8l265.2 265.2zm-221.2-221C92.2 8.7 84.1 12.1 80.1 19.2c-2.2 3.7-3.1 8.1-2.6 12.5v448.6c-.5 4.4.4 8.8 2.6 12.5 4 7.1 12.1 10.5 19.1 6.1l265.2-265.2zm357.6 244.2-74.1-41.7-69.7 69.7 69.7 69.7 74.1-41.7c15.7-8.8 15.7-31.1 0-39.7z"/>
                </svg>
                <span>Download App</span>
            </Button>
            </a>
            <a
            href="https://t.me/yourgroup"
            target="_blank"
            rel="noopener noreferrer"
            className="transform hover:-translate-y-2 transition-transform duration-300"
            >
            <Button
            size="lg"
            className="bg-gradient-to-r from-blue-300 to-blue-600 hover:from-blue-400 hover:to-blue-700 text-white text-lg font-bold px-10 py-6 rounded-xl flex items-center gap-4 shadow-2xl transition-all duration-200 border-2 border-blue-200/40"
            >
            <FaTelegramPlane className="text-3xl animate-pulse" />
            <span>Join Telegram</span>
            </Button>
            </a>
            </div>
            {/* Custom CSS for Neon Glow and Glassmorphism */}
            <style jsx>{`
            .neon-glow {
            box-shadow: 0 0 30px 5px #fb923c88, 0 0 60px 10px #fbbf2488;
            }
            .glass-card {
            backdrop-filter: blur(8px);
            background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(251,146,60,0.15) 100%);
            }
            @keyframes spin-slow {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
            }
            .animate-spin-slow {
            animation: spin-slow 4s linear infinite;
            }
            `}</style>
        </div>
    );
}

export default BeforeFooter