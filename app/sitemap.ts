import type { MetadataRoute } from 'next';
import { getPb } from '@/lib/pocketbase';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://urbanserve.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${APP_URL}/gigs`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${APP_URL}/pick-drop`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${APP_URL}/premium`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${APP_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    // /dashboard, /earnings, /onboarding, /notifications, /logout, /oauth-callback are
    // intentionally excluded — they are private, user-specific pages (see next.config.mjs
    // and their layout.tsx `robots: { index: false }` for the matching noindex rule).
  ];

  // Best-effort: include individual open job postings so Google can index them
  // directly (helps with "Google for Jobs" style rich results too).
  try {
    const pb = getPb();
    const jobs = await pb.collection('jobs').getFullList({
      filter: 'status="open"',
      sort: '-created',
      fields: 'id,updated',
    });
    const jobRoutes: MetadataRoute.Sitemap = jobs.map((job: any) => ({
      url: `${APP_URL}/gigs?job=${job.id}`,
      lastModified: new Date(job.updated),
      changeFrequency: 'daily',
      priority: 0.6,
    }));
    return [...staticRoutes, ...jobRoutes];
  } catch {
    // PocketBase unreachable at build time — fall back to static routes only.
    return staticRoutes;
  }
}
