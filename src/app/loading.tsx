'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gradient-to-tr from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        <div className="mb-6 animate-spin">
          <Loader2 size={48} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold">Loading Your Tournament...</h1>
        <p className="text-sm text-gray-300 mt-2">Please wait a moment</p>
      </motion.div>
    </div>
  );
}
