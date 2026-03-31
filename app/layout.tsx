import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LangProvider } from '@/context/LangContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'UrbanServe — Find Jobs & Hire Workers in India',
    template: '%s | UrbanServe',
  },
  description: 'UrbanServe is India\'s trusted platform to find gig jobs, hire verified daily-wage workers, book pick & drop runners, and manage manpower — all in one app.',
  keywords: ['gig jobs India', 'hire workers', 'daily wage jobs', 'pick and drop', 'manpower services', 'find work India', 'UrbanServe'],
  authors: [{ name: 'UrbanServe' }],
  creator: 'UrbanServe',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://urbanserve.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'UrbanServe',
    title: 'UrbanServe — Find Jobs & Hire Workers in India',
    description: 'Hire verified workers, find gig jobs, book pick & drop runners across India.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UrbanServe — Find Jobs & Hire Workers in India',
    description: 'Hire verified workers, find gig jobs, book pick & drop runners across India.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/leaf-icon.png',
    apple: '/leaf-icon.png',
    shortcut: '/leaf-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#16a34a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <AuthProvider>
          <LangProvider>
            <Navbar />
            {/* mob-page-wrap adds bottom padding on mobile for the fixed bottom nav */}
            <main className="mob-page-wrap" style={{ flex: 1 }}>{children}</main>
            <Footer />
          </LangProvider>
        </AuthProvider>
      </body>
    </html>
  );
}