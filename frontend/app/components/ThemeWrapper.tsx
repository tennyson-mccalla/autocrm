'use client';

import { ThemeProvider } from 'next-themes';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange
      enableColorScheme={false}
    >
      {children}
    </ThemeProvider>
  );
}
