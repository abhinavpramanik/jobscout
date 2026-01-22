'use client';

import { Toaster as Sonner } from 'sonner';
import { useTheme } from 'next-themes';

export function Toaster() {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as 'light' | 'dark' | 'system'}
      position="top-right"
      toastOptions={{
        style: {
          background: theme === 'dark' ? 'rgb(15 23 42)' : 'white',
          color: theme === 'dark' ? 'rgb(226 232 240)' : 'rgb(15 23 42)',
          border: `1px solid ${theme === 'dark' ? 'rgb(51 65 85)' : 'rgb(226 232 240)'}`,
        },
      }}
    />
  );
}
