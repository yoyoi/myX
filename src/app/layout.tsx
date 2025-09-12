import '../styles/globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import Providers from './providers';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'mini-X',
  description: 'A tiny X/Twitter-like app with realtime.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="container py-6 space-y-6">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
