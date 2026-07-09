import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://freightflow.techsonance.co.in').replace(/\/$/, '');

  const routes = [
    '',
    '/about',
    '/blog',
    '/changelog',
    '/contact',
    '/security',
    '/license',
    '/terms-of-service',
    '/privacy-policy',
    '/cookie-policy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : (route === '/blog' || route === '/changelog' ? 'weekly' : 'monthly'),
    priority: route === '' ? 1.0 : (route === '/about' || route === '/contact' ? 0.8 : 0.5),
  }));
}
