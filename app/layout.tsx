import type { Metadata } from 'next';
import { DM_Serif_Display, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { defaultSettings } from '@/config/default-settings';

const dmSerif = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
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
    <html lang="en" className={`${dmSerif.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-white font-sans antialiased text-body-text">
        <SettingsProvider>
          {children}
          <Toaster position="top-right" />
        </SettingsProvider>
      </body>
    </html>
  );
}
