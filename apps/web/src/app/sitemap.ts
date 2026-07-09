import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://freightflow.techsonance.co.in').replace(/\/$/, '');

  const routes = [
    { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/about', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/blog', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/changelog', changeFrequency: 'weekly' as const, priority: 0.6 },
    { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/security', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/license', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/terms-of-service', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/privacy-policy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/cookie-policy', changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}

