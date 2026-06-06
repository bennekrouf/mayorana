import { Geist } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '../providers';
import React from 'react';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
