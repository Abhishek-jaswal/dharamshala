import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LangProvider } from '@/context/LangContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://urbanserve.in';

export const metadata: Metadata = {
  title: {
    default: 'UrbanServe — Find Jobs & Hire Workers in India',
    template: '%s | UrbanServe',
  },
  description:
    "India's simplest platform to find gig jobs, hire verified daily-wage workers, book pick & drop runners — all free, no middleman.",
  keywords: [
    'gig jobs India', 'hire workers', 'daily wage jobs', 'pick and drop',
    'manpower services', 'find work India', 'UrbanServe', 'नौकरी', 'मजदूर',
    'plumber near me', 'electrician near me', 'cook near me', 'driver jobs India',
  ],
  authors: [{ name: 'UrbanServe', url: APP_URL }],
  creator: 'UrbanServe',
  publisher: 'UrbanServe',
  metadataBase: new URL(APP_URL),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: APP_URL,
    siteName: 'UrbanServe',
    title: 'UrbanServe — Find Jobs & Hire Workers in India',
    description: 'Hire verified workers or find jobs. Plumbers, cooks, drivers, cleaners & more — direct contact, zero commission.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'UrbanServe' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UrbanServe — Find Jobs & Hire Workers in India',
    description: 'Hire verified workers or find jobs. Direct contact, zero commission.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/icon-192.png',
  },
  manifest: '/manifest.json',
  applicationName: 'UrbanServe',
  category: 'jobs',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#16a34a' },
    { media: '(prefers-color-scheme: dark)', color: '#16a34a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="UrbanServe" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-TileImage" content="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'UrbanServe',
              url: APP_URL,
              logo: `${APP_URL}/icon-512.png`,
              description: "India's simplest platform to find gig jobs and hire verified workers.",
              contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: 'support@urbanserve.in' },
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}`,
          }}
        />
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <AuthProvider>
          <LangProvider>
            <Navbar />
            <main className="mob-page-wrap" style={{ flex: 1 }}>{children}</main>
            <Footer />
          </LangProvider>
        </AuthProvider>
      </body>
    </html>
  );
}