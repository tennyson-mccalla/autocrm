import './globals.css';
import { Providers } from './components/Providers';
import { Header } from './components/Header';
import { Inter } from 'next/font/google';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseProvider } from './components/SupabaseProvider';

const inter = Inter({ subsets: ['latin'] });

const ThemeProvider = NextThemesProvider as any;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* @ts-ignore */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider>
            <AuthProvider>
              <Providers>
                <div className="min-h-full flex flex-col bg-background text-foreground">
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                </div>
              </Providers>
            </AuthProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
