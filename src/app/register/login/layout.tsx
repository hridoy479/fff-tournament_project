
import { ThemeProvider } from '@/components/theme-provider';
import React from 'react';
import Header from '../Header';

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Header />
      <div className="flex items-center justify-center text-center min-h-screen p-[35px] mt-4 md:mt-12 ">
        {children}
      </div>
    </ThemeProvider>
  );
}
