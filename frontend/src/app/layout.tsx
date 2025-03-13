import { Providers } from '../components/Providers';
import './globals.css';
import type { Metadata } from 'next';
import type { Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Booking System',
  description: 'A simple booking system',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Providers>
         
          {children}
        </Providers>
      </body>
    </html>
  );
}