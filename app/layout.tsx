import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';

const BASE_URL = 'https://metamechsolutions.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'MetaMech Solutions — SolidWorks Engineering Automation Tools',
    template: '%s | MetaMech Solutions',
  },
  description:
    'SolidWorks automation tools and macros designed to reduce repetitive work, minimize errors, and accelerate your product development workflow. BOM Automation, PDF Merge, STEP/DXF Export.',
  keywords: [
    'SolidWorks automation',
    'BOM automation',
    'PDF merge',
    'STEP export',
    'DXF export',
    'engineering automation',
    'CAD automation',
    'SolidWorks macros',
    'mechanical engineering tools',
  ],
  authors: [{ name: 'MetaMech Solutions' }],
  creator: 'MetaMech Solutions',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'MetaMech Solutions',
    title: 'MetaMech Solutions — SolidWorks Engineering Automation Tools',
    description:
      'SolidWorks automation tools designed to reduce repetitive work, minimize errors, and accelerate your product development workflow.',
    images: [{ url: `${BASE_URL}/metamech-logo.png`, width: 512, height: 512, alt: 'MetaMech Solutions Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MetaMech Solutions — SolidWorks Engineering Automation Tools',
    description:
      'SolidWorks automation tools designed to reduce repetitive work, minimize errors, and accelerate your product development workflow.',
    images: [`${BASE_URL}/metamech-logo.png`],
  },
  icons: {
    icon: '/metamech-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-navy text-white overflow-x-hidden">
        <ParticleBackground />
        <Navigation />
        <main className="relative z-[1]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
