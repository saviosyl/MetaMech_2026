import Link from 'next/link';
import {
  Table, Files, FileOutput, ArrowRight, Settings, Play, Download,
  Quote, Users, Clock, Target, BarChart3, Building2
} from 'lucide-react';
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

const howItWorksSteps = [
  {
    number: '01',
    title: 'Install & Connect',
    description: 'Install MetaMech and connect it to your SolidWorks environment. Setup takes under 5 minutes.',
    icon: Download,
  },
  {
    number: '02',
    title: 'Configure Your Workflow',
    description: 'Set up templates, naming rules, and output preferences to match your company standards.',
    icon: Settings,
  },
  {
    number: '03',
    title: 'Automate & Save Hours',
    description: 'Run your automation tasks with one click. BOMs, PDFs, exports — all done in seconds.',
    icon: Play,
  },
];

const stats = [
  { value: '10,000+', label: 'Hours Saved', icon: Clock },
  { value: '500+', label: 'Engineers', icon: Users },
  { value: '99.9%', label: 'Accuracy', icon: Target },
  { value: '50+', label: 'Companies', icon: Building2 },
];

const testimonials = [
  {
    quote: 'MetaMech paid for itself in the first week. Our BOM creation went from hours to seconds, and the accuracy is flawless.',
    name: 'Sarah Johansson',
    role: 'Senior Design Engineer',
    company: 'Scandia Robotics AB',
  },
  {
    quote: 'We tried other automation tools before — MetaMech is the only one that actually understands the SolidWorks workflow. It just works.',
    name: 'Thomas Keller',
    role: 'Engineering Manager',
    company: 'Keller Maschinenbau',
  },
  {
    quote: 'The PDF merge tool alone saved our documentation team 15 hours per week. The ROI was immediate and obvious.',
    name: 'Elena Vasquez',
    role: 'Technical Lead',
    company: 'MedPrecision Systems',
  },
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

function HowItWorks() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-navy-light" />
      <div className="relative z-10 max-w-7xl xl:max-w-8xl 2xl:max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-16">
          <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">
            HOW IT <span className="text-gradient-teal">WORKS</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Get up and running in minutes. No coding, no complex setup.
          </p>
        </div>

        <AnimatedStagger className="grid md:grid-cols-3 gap-8 lg:gap-12" stagger={0.2}>
          {howItWorksSteps.map((step, index) => (
            <div key={index} className="relative group text-center">
              {/* Connector */}
              {index < howItWorksSteps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-[60%] w-[calc(100%-20%)] h-[2px] bg-gradient-to-r from-cyan-500/40 to-cyan-500/10" />
              )}
              <div className="glass-card p-8 hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-cyan-500/30 transition-all duration-300">
                  <step.icon size={28} className="text-cyan-400" />
                </div>
                <div className="font-orbitron text-4xl font-bold text-cyan-500/20 mb-3">{step.number}</div>
                <h3 className="font-orbitron text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </AnimatedStagger>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-navy">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal/5 rounded-full blur-[200px]" />
      </div>
      <div className="relative z-10 max-w-7xl xl:max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimatedStagger className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8" stagger={0.1}>
          {stats.map((stat, index) => (
            <div key={index} className="glass-card p-6 sm:p-8 text-center group hover:-translate-y-2 transition-all duration-300 hover:border-cyan-500/30">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
                <stat.icon size={22} className="text-cyan-400" />
              </div>
              <div className="font-orbitron text-3xl sm:text-4xl font-bold text-gradient-teal mb-2">
                {stat.value}
              </div>
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </AnimatedStagger>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-navy-light" />
      <div className="relative z-10 max-w-7xl xl:max-w-8xl 2xl:max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-16">
          <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">
            WHAT ENGINEERS <span className="text-gradient-gold">SAY</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Real results from real engineering teams.
          </p>
        </div>

        <AnimatedStagger className="grid md:grid-cols-3 gap-6 lg:gap-8" stagger={0.15}>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card p-6 sm:p-8 group hover:-translate-y-2 transition-all duration-300 hover:border-gold/30"
            >
              <Quote size={32} className="text-gold/20 mb-4" />
              <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center">
                    <Users size={18} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-gray-500 text-xs">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            </div>
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
      <HowItWorks />
      <StatsSection />
      <TestimonialsSection />
      <IndustriesStrip />
      <CTASection />
    </>
  );
}
