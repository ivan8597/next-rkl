import { Providers } from '@/components/Providers';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Система бронирования',
  description: 'Бронирование мест',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}