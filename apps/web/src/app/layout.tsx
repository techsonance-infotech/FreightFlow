import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { OfflineBanner } from '@/components/pwa/offline-banner';
import { SyncStatus } from '@/components/pwa/sync-status';
import { UpdatePrompt } from '@/components/pwa/update-prompt';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FreightFlow — Transport Management Platform',
  description:
    'Every Trip. Every Rupee. Every Mile — In Control. Multi-tenant SaaS platform for Indian road transport and logistics companies.',
  keywords: ['freight', 'transport', 'logistics', 'LR', 'lorry receipt', 'fleet management', 'India'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FreightFlow',
  },
  formatDetection: {
    telephone: false,
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
          {children}
          <OfflineBanner />
          <SyncStatus />
          <UpdatePrompt />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
