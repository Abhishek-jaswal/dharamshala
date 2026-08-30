import type { Metadata } from 'next';
import { getPb } from '@/lib/pocketbase';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://urbanserve.in';

export const metadata: Metadata = {
  title: 'Find Jobs & Hire Workers Near You',
  description:
    'Browse daily-wage, hourly, part-time and full-time jobs across India, or post a job and hire verified workers instantly — zero commission, direct contact.',
  keywords: [
    'jobs near me', 'daily wage jobs', 'hire workers online', 'part time jobs India',
    'gig jobs India', 'post a job free', 'find electrician', 'find plumber',
    'नौकरी', 'मजदूर हायर करें',
  ],
  alternates: { canonical: '/gigs' },
  openGraph: {
    title: 'Find Jobs & Hire Workers — UrbanServe',
    description: 'Browse open jobs or post one in 30 seconds. Verified workers, direct contact, zero commission.',
    url: '/gigs',
  },
};

// Injects Google-for-Jobs-style JobPosting structured data for currently open
// jobs. This runs server-side in the layout (gigs/page.tsx itself is a client
// component and can't export metadata/JSON-LD), so it doesn't touch the
// existing gigs page logic at all — purely additive for organic search traffic.
async function getOpenJobsJsonLd() {
  try {
    const pb = getPb();
    const jobs = await pb.collection('jobs').getList(1, 20, {
      filter: 'status="open"',
      sort: '-created',
    });
    return jobs.items.map((job: any) => ({
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.title,
      description: job.title, // swap for a full job description field if/when added
      datePosted: job.created,
      employmentType: (job.type || 'CONTRACTOR').toUpperCase().replace(/[\s-]/g, '_'),
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company || 'UrbanServe Employer',
        sameAs: APP_URL,
      },
      jobLocation: {
        '@type': 'Place',
        address: { '@type': 'PostalAddress', addressLocality: job.location || 'India', addressCountry: 'IN' },
      },
      baseSalary: job.pay
        ? { '@type': 'MonetaryAmount', currency: 'INR', value: { '@type': 'QuantitativeValue', value: job.pay } }
        : undefined,
      directApply: true,
    }));
  } catch {
    return [];
  }
}

export default async function GigsLayout({ children }: { children: React.ReactNode }) {
  const jobPostings = await getOpenJobsJsonLd();

  return (
    <>
      {jobPostings.map((jsonLd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}
      {children}
    </>
  );
}
