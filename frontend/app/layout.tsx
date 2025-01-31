import './globals.css';
import { Providers } from './components/Providers';
import { Header } from './components/Header';
import { Inter } from 'next/font/google';
import { ThemeWrapper } from './components/ThemeWrapper';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`h-full bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 ${inter.className}`} suppressHydrationWarning>
        <ThemeWrapper>
          <Providers>
            <div className="min-h-full flex flex-col">
              <Header />
              <main className="flex-1 bg-gray-50 dark:bg-gray-900">
                {children}
              </main>
            </div>
          </Providers>
        </ThemeWrapper>
      </body>
    </html>
  );
}
