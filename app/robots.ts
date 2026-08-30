import type { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://urbanserve.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/earnings',
          '/onboarding',
          '/notifications',
          '/oauth-callback',
          '/logout',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
