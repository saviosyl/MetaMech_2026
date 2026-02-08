import type { Metadata } from 'next';
import Link from 'next/link';
import { Table, Files, FileOutput, Check, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import AnimatedToolsContent from '@/components/AnimatedToolsContent';

export const metadata: Metadata = {
  title: 'SolidWorks Automation Tools',
  description:
    'Explore MetaMech SolidWorks automation tools: BOM Automation, PDF Merge with Index, and STEP/DXF Batch Export. Streamline your engineering workflow.',
  openGraph: {
    title: 'SolidWorks Automation Tools | MetaMech Solutions',
    description: 'Explore MetaMech SolidWorks automation tools for BOM, PDF Merge, and STEP/DXF Export.',
    url: 'https://metamechsolutions.com/tools',
  },
  alternates: { canonical: 'https://metamechsolutions.com/tools' },
};

const tools = [
  {
    icon: Table,
    title: 'BOM Automation',
    description:
      'Generate accurate Bills of Materials with custom templates and automatic formatting.',
    features: [
      'Custom Excel templates',
      'Automatic part number sequencing',
      'Multi-configuration support',
      'Real-time updates',
    ],
    href: '/tools/bom',
    color: 'cyan' as const,
  },
  {
    icon: Files,
    title: 'PDF Merge + Index',
    description:
      'Combine multiple drawings into a single PDF with automatic index generation and bookmarks.',
    features: [
      'Batch PDF merging',
      'Automatic index creation',
      'Clickable bookmarks',
      'Custom page numbering',
    ],
    href: '/tools/pdf-merge',
    color: 'gold' as const,
  },
  {
    icon: FileOutput,
    title: 'STEP / DXF Export',
    description:
      'Export multiple files in batch with consistent naming and folder organization.',
    features: [
      'Batch file export',
      'Custom naming conventions',
      'Automatic folder structure',
      'Format validation',
    ],
    href: '/tools/file-export',
    color: 'cyan' as const,
  },
];

export default function ToolsPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://metamechsolutions.com' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://metamechsolutions.com/tools' },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <section className="relative py-20 lg:py-32 overflow-hidden pt-[100px]">
        <div className="absolute inset-0 bg-navy">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl xl:max-w-8xl 2xl:max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <Breadcrumbs items={[{ name: 'Tools' }]} />

          <div className="text-center mb-16">
            <h1 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              SOLIDWORKS <span className="text-gradient-teal">AUTOMATION TOOLS</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Streamline your engineering workflow with powerful automation tools designed specifically for SolidWorks.
            </p>
          </div>

          <AnimatedToolsContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" style={{ perspective: '800px' }}>
            {tools.map((tool, index) => (
              <Link
                key={index}
                href={tool.href}
                data-animate="tool-card"
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

                <h2 className="font-orbitron text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {tool.title}
                </h2>

                <p className="text-gray-400 text-sm mb-6 leading-relaxed">{tool.description}</p>

                <ul className="space-y-2 mb-6">
                  {tool.features.map((feature, fIndex) => (
                    <li
                      key={fIndex}
                      className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-400 transition-colors"
                    >
                      <Check
                        size={14}
                        className={`flex-shrink-0 ${tool.color === 'cyan' ? 'text-cyan-400' : 'text-gold'}`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <span
                  className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 group-hover:gap-3 ${
                    tool.color === 'cyan' ? 'text-cyan-400' : 'text-gold'
                  }`}
                >
                  Learn More <ArrowRight size={16} />
                </span>

                <div
                  className={`absolute inset-0 rounded-2xl border border-transparent group-hover:border-opacity-100 transition-all duration-300 pointer-events-none ${
                    tool.color === 'cyan' ? 'group-hover:border-cyan-500/50' : 'group-hover:border-gold/50'
                  }`}
                />
              </Link>
            ))}
          </div>
          </AnimatedToolsContent>
        </div>
      </section>
    </>
  );
}
