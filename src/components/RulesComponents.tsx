'use client';
import { motion } from 'framer-motion'
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';


function RulesComponents() {
    const [close, setclose] = useState(false);
    const handleClose = () => {
        setclose(true);
    };
    if (close) return null; // If closed, return null to hide the component
  return (
    <div className="flex flex-col md:flex-row gap-8 lg:w-[80%] items-start bg-muted p-8 rounded-2xl shadow-lg border-4 border-primary/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl mt-10 mb-10 relative group hover:border-blue-500 dark:hover:border-purple-400">
        <button
            onClick={handleClose}
            className="absolute top-3 right-2 z-20  rounded-full p-2 shadow bg-white text-black cursor-pointer transition-colors duration-200 hover:text-red-600 dark:hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 dark:focus:ring-red-500"
            aria-label="Close"
        >
            <FaTimes className="h-3 w-3" aria-hidden="true" />
        </button>
      <div className="absolute inset-0 rounded-2xl pointer-events-none z-0 border-4 border-transparent group-hover:border-transparent transition-all duration-500">
        <span
          className="absolute inset-0 rounded-2xl border-4 border-transparent group-hover:border-transparent"
          style={{
            background: 'linear-gradient(120deg, #ff6ec4, #7873f5, #42e695, #ff6ec4)',
            backgroundSize: '300% 300%',
            animation: 'gradient-border 2s ease-in-out infinite',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            padding: '0.25rem',
            zIndex: 1,
            opacity: 0,
            transition: 'opacity 0.5s',
          }}
          aria-hidden="true"
        />
        <style>
          {`
            .group:hover span[aria-hidden="true"] {
              opacity: 1;
            }
            @keyframes gradient-border {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}
        </style>
      </div>
      <div className="flex-1 z-10">
        <h2 className="text-2xl font-bold text-primary mb-4">How to Use Our App</h2>
        <ol className="list-decimal list-inside text-muted-foreground text-lg space-y-2">
          <li>Register or log in to your account.</li>
          <li>Browse available tournaments and join your favorite one.</li>
        </ol>
      </div>
      <div className="flex-1 flex justify-center z-10">
        <motion.div
          className="w-full max-w-md aspect-video rounded-xl overflow-hidden shadow-xl border-2 border-primary bg-background transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:border-accent"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
          whileHover={{ scale: 1.07, boxShadow: "0 12px 40px rgba(80,80,255,0.18)" }}
        >
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="How to use our app"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy"
            allowFullScreen
          ></iframe>
        </motion.div>
      </div>
    </div>
  )
}

export default RulesComponents