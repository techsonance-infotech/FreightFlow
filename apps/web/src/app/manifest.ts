import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FreightFlow SaaS',
    short_name: 'FreightFlow',
    description: 'Enterprise Logistics & Fleet Management',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait',
    categories: ['business', 'productivity', 'finance'],
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'View overview metrics',
        url: '/dashboard',
      },
      {
        name: 'New Trip',
        short_name: 'Trip',
        description: 'Create a new logistics trip',
        url: '/dashboard/operations/trips/new',
      }
    ],
  };
}
