import './globals.css';
import { Providers } from '../components/Providers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AutoCRM',
  description: 'Customer Relationship Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
