import type { Metadata } from 'next';
import Link from 'next/link';
import { Files, Check, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import AnimatedToolsContent from '@/components/AnimatedToolsContent';

export const metadata: Metadata = {
  title: 'PDF Merge + Index',
  description:
    'Merge SolidWorks drawings into a single PDF with automatic index generation, clickable bookmarks, and custom page numbering. Batch PDF merging tool.',
  openGraph: {
    title: 'PDF Merge + Index | MetaMech Solutions',
    description: 'Merge SolidWorks drawings into a single PDF with automatic index and bookmarks.',
    url: 'https://metamechsolutions.com/tools/pdf-merge',
  },
  alternates: { canonical: 'https://metamechsolutions.com/tools/pdf-merge' },
};

const features = [
  'Batch PDF merging from multiple SolidWorks drawings',
  'Automatic index creation with part details',
  'Clickable bookmarks for fast navigation',
  'Custom page numbering and headers',
  'Drawing revision tracking in merged output',
  'Configurable sort order and grouping',
  'Cover page generation with project details',
  'Export to single or multi-file PDF packages',
];

const benefits = [
  { title: 'One-Click Package', desc: 'Merge entire drawing sets into professional PDF packages instantly.' },
  { title: 'Auto-Generated Index', desc: 'Never manually create drawing indexes again.' },
  { title: 'Smart Bookmarks', desc: 'Navigate large drawing packages with clickable bookmarks.' },
  { title: 'Revision Tracking', desc: 'Track drawing revisions automatically in merged output.' },
];

export default function PDFMergePage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MetaMech PDF Merge + Index',
    applicationCategory: 'EngineeringApplication',
    operatingSystem: 'Windows',
    description: 'Merge SolidWorks drawings into a single PDF with automatic index generation.',
    offers: {
      '@type': 'Offer',
      price: '999',
      priceCurrency: 'EUR',
    },
    creator: { '@type': 'Organization', name: 'MetaMech Solutions' },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://metamechsolutions.com' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://metamechsolutions.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'PDF Merge', item: 'https://metamechsolutions.com/tools/pdf-merge' },
    ],
  };

  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={breadcrumbSchema} />
      <section className="relative py-20 lg:py-32 overflow-hidden pt-[100px]">
        <div className="absolute inset-0 bg-navy">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-teal/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl xl:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <Breadcrumbs items={[{ name: 'Tools', href: '/tools' }, { name: 'PDF Merge + Index' }]} />

          <AnimatedToolsContent>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="w-16 h-16 rounded-xl bg-gold/20 flex items-center justify-center mb-6">
                <Files size={32} className="text-gold" />
              </div>
              <h1 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                PDF MERGE + <span className="text-gradient-gold">INDEX</span>
              </h1>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Combine multiple SolidWorks drawings into a single, professionally formatted PDF with
                automatic index generation, clickable bookmarks, and custom page numbering. Create
                complete drawing packages in seconds.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link href="/download" className="btn-primary flex items-center gap-2">
                  Start Free Trial <ArrowRight size={18} />
                </Link>
                <Link href="/pricing" className="btn-secondary flex items-center gap-2">
                  View Pricing <ArrowRight size={18} />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((b, i) => (
                  <div key={i} data-animate="benefit" className="glass-card p-5 group hover:-translate-y-1 transition-all duration-300">
                    <h3 className="font-orbitron text-sm font-bold text-gold mb-2">{b.title}</h3>
                    <p className="text-gray-500 text-sm">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8">
              <h2 className="font-orbitron text-xl font-bold text-white mb-6">
                Features & <span className="text-gradient-gold">Capabilities</span>
              </h2>
              <ul className="space-y-4">
                {features.map((feature, i) => (
                  <li key={i} data-animate="feature" className="flex items-start gap-3 text-gray-400 group">
                    <Check size={18} className="text-gold mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="group-hover:text-gray-300 transition-colors">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-white/10">
                <Link href="/contact" className="w-full btn-primary flex items-center justify-center gap-2">
                  Request a Demo <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
          </AnimatedToolsContent>
        </div>
      </section>
    </>
  );
}
