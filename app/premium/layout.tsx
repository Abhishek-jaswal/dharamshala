import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Go Premium — Featured Placement for Professionals',
  description:
    'Upgrade to UrbanServe Pro or Business. Get a featured badge, top placement in search results, and grow your earnings faster.',
  alternates: { canonical: '/premium' },
  openGraph: {
    title: 'UrbanServe Premium — Get Featured, Get Hired Faster',
    description:
      'Compare Free, Pro and Business plans and unlock featured placement, priority support and earnings analytics.',
    url: '/premium',
  },
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
