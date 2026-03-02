import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { defaultSettings } from '@/config/default-settings';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <SettingsProvider>
          {children}
          <Toaster position="top-right" />
        </SettingsProvider>
      </body>
    </html>
  );
}
