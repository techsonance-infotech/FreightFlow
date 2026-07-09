import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://freightflow.techsonance.co.in').replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/admin/',
        '/api/',
        '/onboarding/',
        '/auth/',
        '/_next/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
