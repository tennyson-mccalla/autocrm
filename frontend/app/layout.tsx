import './globals.css';
import { Providers } from './components/Providers';
import { Header } from './components/Header';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <div className="min-h-full flex flex-col bg-background text-foreground">
              <Header />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
