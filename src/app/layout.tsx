import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Claude Swarm Supervisor',
  description: 'Manage Claude Code sub-agent swarms',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="p-4 bg-gray-800 text-white">
          <a href="/create" className="mr-4">Create Swarm</a>
          <a href="/supervise">Supervise Swarm</a>
        </nav>
        {children}
      </body>
    </html>
  );
}