import type { Metadata } from 'next';
import Link from 'next/link';
import { FileOutput, Check, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import AnimatedToolsContent from '@/components/AnimatedToolsContent';

export const metadata: Metadata = {
  title: 'STEP / DXF Export',
  description:
    'Batch export SolidWorks files to STEP and DXF formats with custom naming conventions, automatic folder structure, and format validation.',
  openGraph: {
    title: 'STEP / DXF Export | MetaMech Solutions',
    description: 'Batch export SolidWorks files to STEP and DXF with custom naming and folder structure.',
    url: 'https://metamechsolutions.com/tools/file-export',
  },
  alternates: { canonical: 'https://metamechsolutions.com/tools/file-export' },
};

const features = [
  'Batch export to STEP, DXF, and other formats',
  'Custom naming conventions with variables',
  'Automatic folder structure creation',
  'Format validation before export',
  'Configuration-specific exports',
  'Revision-based file naming',
  'Selective export by part type or property',
  'Export log and error reporting',
];

const benefits = [
  { title: 'Batch Processing', desc: 'Export hundreds of files with a single click.' },
  { title: 'Smart Naming', desc: 'Automatic file naming based on part properties and revisions.' },
  { title: 'Folder Organization', desc: 'Files are automatically organized into the right directories.' },
  { title: 'Quality Checks', desc: 'Built-in validation ensures all exports are correct.' },
];

export default function FileExportPage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MetaMech STEP / DXF Export',
    applicationCategory: 'EngineeringApplication',
    operatingSystem: 'Windows',
    description: 'Batch export SolidWorks files to STEP and DXF formats.',
    offers: {
      '@type': 'Offer',
      price: '1299',
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
      { '@type': 'ListItem', position: 3, name: 'STEP/DXF Export', item: 'https://metamechsolutions.com/tools/file-export' },
    ],
  };

  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={breadcrumbSchema} />
      <section className="relative py-20 lg:py-32 overflow-hidden pt-[100px]">
        <div className="absolute inset-0 bg-navy">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl xl:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <Breadcrumbs items={[{ name: 'Tools', href: '/tools' }, { name: 'STEP / DXF Export' }]} />

          <AnimatedToolsContent>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="w-16 h-16 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6">
                <FileOutput size={32} className="text-cyan-400" />
              </div>
              <h1 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                STEP / DXF <span className="text-gradient-teal">EXPORT</span>
              </h1>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Export multiple SolidWorks files in batch with consistent naming conventions,
                automatic folder organization, and built-in format validation. Perfect for
                manufacturing handoffs and supplier packages.
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
                    <h3 className="font-orbitron text-sm font-bold text-cyan-400 mb-2">{b.title}</h3>
                    <p className="text-gray-500 text-sm">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8">
              <h2 className="font-orbitron text-xl font-bold text-white mb-6">
                Features & <span className="text-gradient-teal">Capabilities</span>
              </h2>
              <ul className="space-y-4">
                {features.map((feature, i) => (
                  <li key={i} data-animate="feature" className="flex items-start gap-3 text-gray-400 group">
                    <Check size={18} className="text-cyan-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
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
