import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { defaultSettings } from '@/config/default-settings';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: defaultSettings.metadata.title,
  description: defaultSettings.metadata.description,
  keywords: defaultSettings.metadata.keywords,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <SettingsProvider>
          {children}
          <Toaster position="top-right" />
        </SettingsProvider>
      </body>
    </html>
  );
}
