import './globals.css';
import { Providers } from './components/Providers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AutoCRM',
  description: 'Automated Customer Relationship Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
