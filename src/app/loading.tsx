"use client"
export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute h-full w-full animate-spin rounded-full border-4 border-gray-700 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-700 dark:bg-gray-300" />
        </div>

        {/* Text */}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Loading...
        </p>

        {/* Progress Bar */}
        <div className="h-1 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-full w-1/3 animate-progress rounded-full bg-gray-600 dark:bg-gray-300" />
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-progress { animation: progress 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}