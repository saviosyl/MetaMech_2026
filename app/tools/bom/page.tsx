import type { Metadata } from 'next';
import Link from 'next/link';
import { Table, Check, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import AnimatedToolsContent from '@/components/AnimatedToolsContent';

export const metadata: Metadata = {
  title: 'BOM Automation',
  description:
    'Automate SolidWorks Bill of Materials generation with custom Excel templates, automatic part numbering, multi-configuration support, and real-time updates.',
  openGraph: {
    title: 'BOM Automation | MetaMech Solutions',
    description: 'Automate SolidWorks Bill of Materials generation with custom Excel templates.',
    url: 'https://metamechsolutions.com/tools/bom',
  },
  alternates: { canonical: 'https://metamechsolutions.com/tools/bom' },
};

const features = [
  'Custom Excel templates for consistent BOM formats',
  'Automatic part number sequencing across assemblies',
  'Multi-configuration support for complex designs',
  'Real-time updates as assemblies change',
  'Export to Excel with one click',
  'Configurable column mapping and filtering',
  'Sub-assembly rollup and flattening options',
  'Integration with company ERP and PLM systems',
];

const benefits = [
  { title: 'Save 4+ Hours Per Week', desc: 'Eliminate manual BOM creation and data entry errors.' },
  { title: '99.9% Accuracy', desc: 'Automated extraction ensures no parts are missed or duplicated.' },
  { title: 'Custom Templates', desc: 'Match your company\'s exact BOM format and standards.' },
  { title: 'Multi-Config Ready', desc: 'Handle complex assemblies with multiple configurations effortlessly.' },
];

export default function BOMPage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MetaMech BOM Automation',
    applicationCategory: 'EngineeringApplication',
    operatingSystem: 'Windows',
    description: 'Automate SolidWorks Bill of Materials generation with custom templates.',
    offers: {
      '@type': 'Offer',
      price: '999',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    creator: {
      '@type': 'Organization',
      name: 'MetaMech Solutions',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://metamechsolutions.com' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://metamechsolutions.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'BOM Automation', item: 'https://metamechsolutions.com/tools/bom' },
    ],
  };

  return (
    <>
      <JsonLd data={softwareSchema} />
      <JsonLd data={breadcrumbSchema} />
      <section className="relative py-20 lg:py-32 overflow-hidden pt-[100px]">
        <div className="absolute inset-0 bg-navy">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl xl:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <Breadcrumbs items={[{ name: 'Tools', href: '/tools' }, { name: 'BOM Automation' }]} />

          <AnimatedToolsContent>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Content */}
            <div>
              <div className="w-16 h-16 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6">
                <Table size={32} className="text-cyan-400" />
              </div>
              <h1 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                BOM <span className="text-gradient-teal">AUTOMATION</span>
              </h1>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Generate accurate Bills of Materials with custom templates and automatic formatting.
                Eliminate manual data entry, reduce errors, and save hours every week with our
                powerful BOM extraction and export tools.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link href="/download" className="btn-primary flex items-center gap-2">
                  Start Free Trial <ArrowRight size={18} />
                </Link>
                <Link href="/pricing" className="btn-secondary flex items-center gap-2">
                  View Pricing <ArrowRight size={18} />
                </Link>
              </div>

              {/* Benefits */}
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((b, i) => (
                  <div key={i} data-animate="benefit" className="glass-card p-5 group hover:-translate-y-1 transition-all duration-300">
                    <h3 className="font-orbitron text-sm font-bold text-cyan-400 mb-2">{b.title}</h3>
                    <p className="text-gray-500 text-sm">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Feature List */}
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
