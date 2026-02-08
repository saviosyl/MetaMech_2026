import type { Metadata } from 'next';
import { Stethoscope, Cog, ArrowLeftRight, Cpu, Car, Plane, Factory, Zap, ShoppingCart, Shield } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import AnimatedIndustriesContent from '@/components/AnimatedIndustriesContent';

export const metadata: Metadata = {
  title: 'Industries Served',
  description:
    'MetaMech SolidWorks automation tools are trusted across Medical Devices, Aerospace, Automotive, Robotics, Manufacturing, and more industries worldwide.',
  openGraph: {
    title: 'Industries Served | MetaMech Solutions',
    description: 'MetaMech tools are trusted across Medical Devices, Aerospace, Automotive, Robotics, and more.',
    url: 'https://metamechsolutions.com/industries',
  },
  alternates: { canonical: 'https://metamechsolutions.com/industries' },
};

const industries = [
  { name: 'Medical Devices', icon: Stethoscope },
  { name: 'Automation', icon: Cog },
  { name: 'Conveyors', icon: ArrowLeftRight },
  { name: 'Special Machinery', icon: Cpu },
  { name: 'Robotics', icon: Factory },
  { name: 'Automotive', icon: Car },
  { name: 'Aerospace', icon: Plane },
  { name: 'Industrial Equipment', icon: Factory },
  { name: 'Manufacturing', icon: Cog },
  { name: 'Energy', icon: Zap },
  { name: 'Consumer Products', icon: ShoppingCart },
  { name: 'Defense', icon: Shield },
];

const featureCards = [
  {
    title: 'Medical Device Engineering',
    description:
      'Precision and compliance for life-critical products. Our automation tools ensure accurate documentation and traceability required for medical device development.',
    icon: Stethoscope,
  },
  {
    title: 'Automation Systems',
    description:
      'Streamlined design for robotic and automated systems. Reduce design iteration time and improve consistency across complex automation projects.',
    icon: Cog,
  },
  {
    title: 'Custom Machinery',
    description:
      'Tailored solutions for specialized equipment. From concept to manufacturing, accelerate your custom machinery design process.',
    icon: Factory,
  },
];

export default function IndustriesPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://metamechsolutions.com' },
      { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://metamechsolutions.com/industries' },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <section className="relative py-20 lg:py-32 overflow-hidden pt-[100px]">
        <div className="absolute inset-0 bg-navy">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal/5 rounded-full blur-[200px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-7xl xl:max-w-8xl 2xl:max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <Breadcrumbs items={[{ name: 'Industries' }]} />

          <div className="text-center mb-12">
            <h1 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              TRUSTED ACROSS <span className="text-gradient-teal">INDUSTRIES</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              MetaMech powers engineering teams in diverse sectors worldwide.
            </p>
          </div>

          <AnimatedIndustriesContent>
          {/* Industry Chips */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {industries.map((industry, index) => (
              <div
                key={index}
                data-animate="chip"
                className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300 cursor-default"
              >
                <industry.icon size={16} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium whitespace-nowrap">{industry.name}</span>
              </div>
            ))}
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {featureCards.map((card, index) => (
              <div
                key={index}
                data-animate="feature-card"
                className="glass-card p-6 group hover:-translate-y-3 hover:border-cyan-500/30 transition-all duration-300 card-tilt"
              >
                <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <card.icon size={28} className="text-cyan-400" />
                </div>
                <h2 className="font-orbitron text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {card.title}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
          </AnimatedIndustriesContent>
        </div>
      </section>
    </>
  );
}
