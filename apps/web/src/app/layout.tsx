import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FreightFlow — Transport Management Platform',
  description:
    'Every Trip. Every Rupee. Every Mile — In Control. Multi-tenant SaaS platform for Indian road transport and logistics companies.',
  keywords: ['freight', 'transport', 'logistics', 'LR', 'lorry receipt', 'fleet management', 'India'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
