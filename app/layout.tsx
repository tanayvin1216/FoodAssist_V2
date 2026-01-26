import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Food Assistance Directory | Carteret County',
  description:
    'Find food assistance resources in Carteret County, NC. Search for food pantries, hot meals, and other food assistance programs.',
  keywords: [
    'food assistance',
    'food pantry',
    'Carteret County',
    'North Carolina',
    'hunger relief',
    'food bank',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
