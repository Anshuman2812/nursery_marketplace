import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { Providers } from '@/components/providers';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GreenKart - AI-Powered Plant Marketplace for India',
  description:
    'Buy plants, seeds, pots, and gardening supplies online. Free delivery above Rs 499, 7-day plant guarantee, COD available. Powered by AI Plant Advisor.',
  keywords: ['plants', 'nursery', 'india', 'gardening', 'seeds', 'pots', 'bonsai', 'succulents'],
  manifest: '/manifest.json',
  themeColor: '#16a34a',
  openGraph: {
    title: 'GreenKart - AI-Powered Plant Marketplace',
    description: 'Buy plants online in India with free delivery, AI plant advisor, and 7-day guarantee.',
    type: 'website',
    siteName: 'GreenKart',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GreenKart - Plants Marketplace',
    description: 'Buy plants online in India with free delivery and AI plant advisor.',
  },
};

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased min-h-screen bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
