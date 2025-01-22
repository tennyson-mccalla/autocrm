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
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
