import Link from 'next/link';
import { Table, Files, FileOutput, ArrowRight } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import JsonLd from '@/components/JsonLd';
import AnimatedSection from '@/components/AnimatedSection';
import AnimatedStagger from '@/components/AnimatedStagger';

const tools = [
  {
    icon: Table,
    title: 'BOM Automation',
    description: 'Generate accurate Bills of Materials with custom templates and automatic formatting.',
    href: '/tools/bom',
    color: 'cyan' as const,
  },
  {
    icon: Files,
    title: 'PDF Merge + Index',
    description: 'Combine multiple drawings into a single PDF with automatic index generation and bookmarks.',
    href: '/tools/pdf-merge',
    color: 'gold' as const,
  },
  {
    icon: FileOutput,
    title: 'STEP / DXF Export',
    description: 'Export multiple files in batch with consistent naming and folder organization.',
    href: '/tools/file-export',
    color: 'cyan' as const,
  },
];

const industries = [
  'Medical Devices', 'Automation', 'Conveyors', 'Special Machinery',
  'Robotics', 'Automotive', 'Aerospace', 'Industrial Equipment',
  'Manufacturing', 'Energy', 'Consumer Products', 'Defense',
];

function ToolCards() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-navy">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl xl:max-w-8xl 2xl:max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-16">
          <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            SOLIDWORKS <span className="text-gradient-teal">AUTOMATION TOOLS</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Streamline your engineering workflow with powerful automation tools designed specifically for SolidWorks.
          </p>
        </div>

        <AnimatedStagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" stagger={0.15} rotate3D>
          {tools.map((tool, index) => (
            <Link
              key={index}
              href={tool.href}
              className="group relative glass-card p-6 sm:p-8 transition-all duration-300 hover:-translate-y-3 hover:shadow-card-hover block card-tilt"
              style={{ marginTop: index === 1 ? '40px' : '0' }}
            >
              <div
                className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  tool.color === 'cyan' ? 'shadow-glow-teal' : 'shadow-glow-gold'
                }`}
              />
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
                  tool.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gold/20 text-gold'
                }`}
              >
                <tool.icon size={28} />
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                {tool.title}
              </h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">{tool.description}</p>
              <span
                className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 group-hover:gap-3 ${
                  tool.color === 'cyan' ? 'text-cyan-400 hover:text-cyan-300' : 'text-gold hover:text-gold-light'
                }`}
              >
                Learn More
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </AnimatedStagger>
      </div>
    </section>
  );
}

function IndustriesStrip() {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 bg-navy" />
      <div className="relative z-10 max-w-7xl xl:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
        <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-white mb-8">
          TRUSTED ACROSS <span className="text-gradient-teal">INDUSTRIES</span>
        </h2>
        <AnimatedStagger className="flex flex-wrap justify-center gap-3 mb-8" stagger={0.06} distance={30}>
          {industries.map((name, i) => (
            <div
              key={i}
              className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300"
            >
              {name}
            </div>
          ))}
        </AnimatedStagger>
        <Link href="/industries" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
          View All Industries →
        </Link>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-navy">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal/5 rounded-full blur-[200px]" />
      </div>
      <AnimatedSection className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center" distance={50}>
        <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">
          READY TO <span className="text-gradient-gold text-shimmer">AUTOMATE</span>?
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Start saving design hours today. Choose a plan or request a personalized demo.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/pricing" className="btn-primary flex items-center gap-2">
            View Pricing
            <ArrowRight size={18} />
          </Link>
          <Link href="/contact" className="btn-secondary flex items-center gap-2">
            Request a Demo
            <ArrowRight size={18} />
          </Link>
        </div>
      </AnimatedSection>
    </section>
  );
}

export default function HomePage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MetaMech Solutions',
    url: 'https://metamechsolutions.com',
    logo: 'https://metamechsolutions.com/metamech-logo.png',
    description:
      'SolidWorks automation tools and engineering services. BOM Automation, PDF Merge, STEP/DXF Export.',
    email: 'hi@metamechsolutions.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Galway',
      addressCountry: 'Ireland',
    },
    sameAs: [],
  };

  return (
    <>
      <JsonLd data={organizationSchema} />
      <HeroSection />
      <ToolCards />
      <IndustriesStrip />
      <CTASection />
    </>
  );
}
