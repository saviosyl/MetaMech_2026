import type { Metadata } from 'next';
import Link from 'next/link';
import { Settings, DraftingCompass, Library, Check, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import AnimatedServicesContent from '@/components/AnimatedServicesContent';

export const metadata: Metadata = {
  title: 'Engineering Services',
  description:
    'Professional mechanical design, CAD/Layout/Manufacturing, and SolidWorks library services. Comprehensive engineering support from MetaMech Solutions.',
  openGraph: {
    title: 'Engineering Services | MetaMech Solutions',
    description: 'Professional mechanical design, CAD, and SolidWorks library services.',
    url: 'https://metamechsolutions.com/services',
  },
  alternates: { canonical: 'https://metamechsolutions.com/services' },
};

const services = [
  {
    icon: Settings,
    title: 'Mechanical Design & Engineering',
    description:
      'From concept to production, our engineering team provides comprehensive mechanical design services tailored to your specific requirements.',
    features: [
      'Concept development',
      '3D modeling and simulation',
      'Design optimization',
      'Prototype support',
    ],
  },
  {
    icon: DraftingCompass,
    title: 'CAD / Layout / Manufacturing',
    description:
      'Professional CAD services ensuring your designs are production-ready with accurate documentation and manufacturing specifications.',
    features: [
      'Detailed technical drawings',
      'Manufacturing documentation',
      'Assembly instructions',
      'GD&T implementation',
    ],
  },
  {
    icon: Library,
    title: 'Libraries & Standards',
    description:
      'Build and maintain standardized SolidWorks libraries that ensure consistency and efficiency across your engineering team.',
    features: [
      'Custom SolidWorks libraries',
      'Company standard templates',
      'Design automation setup',
      'Training and documentation',
    ],
  },
];

export default function ServicesPage() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Engineering Services',
    provider: {
      '@type': 'Organization',
      name: 'MetaMech Solutions',
      url: 'https://metamechsolutions.com',
    },
    areaServed: 'Worldwide',
    description: 'Professional mechanical design, CAD services, and SolidWorks library management.',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://metamechsolutions.com' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://metamechsolutions.com/services' },
    ],
  };

  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema} />
      <section className="relative py-20 lg:py-32 overflow-hidden pt-[100px]">
        <div className="absolute inset-0 bg-navy">
          <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-teal/5 rounded-full blur-[200px] -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-7xl xl:max-w-8xl 2xl:max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <Breadcrumbs items={[{ name: 'Services' }]} />

          <div className="text-center mb-16">
            <h1 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              ENGINEERING <span className="text-gradient-gold">SERVICES</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Beyond automation tools, we offer comprehensive engineering support.
            </p>
          </div>

          <AnimatedServicesContent>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8" style={{ perspective: '800px' }}>
            {services.map((service, index) => (
              <div
                key={index}
                className="group glass-card p-6 sm:p-8 transition-all duration-300 hover:-translate-y-3 hover:border-cyan-500/30 hover:shadow-card-hover card-tilt"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <service.icon size={32} className="text-cyan-400" />
                </div>

                <h2 className="font-orbitron text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                  {service.title}
                </h2>

                <p className="text-gray-400 text-sm mb-6 leading-relaxed">{service.description}</p>

                <ul className="space-y-2 mb-8">
                  {service.features.map((feature, fIndex) => (
                    <li
                      key={fIndex}
                      className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-400 transition-colors"
                    >
                      <Check size={14} className="text-cyan-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className="w-full py-3 rounded-xl border border-cyan-500/50 text-cyan-400 font-medium flex items-center justify-center gap-2 hover:bg-cyan-500 hover:text-navy transition-all duration-300"
                >
                  Enquire Now <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
          </AnimatedServicesContent>
        </div>
      </section>
    </>
  );
}
