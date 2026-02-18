import type { Metadata } from 'next';
import { Providers } from './providers';
import Navigation from '@/components/Navigation';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'ProjectMarket - Marketplace for Problem Solvers',
  description: 'Connect buyers with skilled problem solvers and manage projects with Trello-like dashboards',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navigation />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
