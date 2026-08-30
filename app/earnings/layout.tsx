import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Earnings',
  description: 'Track your completed jobs, payouts and monthly earnings on UrbanServe.',
  robots: { index: false, follow: false }, // private, user-specific data
};

export default function EarningsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
