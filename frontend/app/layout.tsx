import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { TweaksPanel } from '@/components/dev/TweaksPanel';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono-var',
});

export const metadata: Metadata = {
  title: 'DLQF Platform',
  description: 'Distributed compute + ML job orchestration · Spring 2026 Challenge',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <Providers>
          <div className="app">
            <Sidebar />
            <main className="main">
              <Topbar crumbs={['DLQF', 'Workspace']} />
              {children}
            </main>
          </div>
          <TweaksPanel />
        </Providers>
      </body>
    </html>
  );
}
