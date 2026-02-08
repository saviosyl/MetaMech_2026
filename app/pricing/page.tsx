import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Star, ArrowRight, Zap, Shield, Crown } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import ROICalculator from '@/components/ROICalculator';
import CheckoutForm from '@/components/CheckoutForm';
import AnimatedPricingContent from '@/components/AnimatedPricingContent';

export const metadata: Metadata = {
  title: 'Pricing & Plans',
  description:
    'MetaMech Solutions pricing: Trial €0 (3 days), Standard €999/yr, Premium €1,299/yr, Premium Plus €1,599/yr. Calculate your ROI and choose the right plan.',
  openGraph: {
    title: 'Pricing & Plans | MetaMech Solutions',
    description: 'Flexible pricing for SolidWorks automation tools. Trial, Standard, Premium, and Premium Plus plans.',
    url: 'https://metamechsolutions.com/pricing',
  },
  alternates: { canonical: 'https://metamechsolutions.com/pricing' },
};

const plans = [
  {
    name: 'Trial',
    price: 0,
    period: '3 days free',
    description: 'Try before you buy',
    icon: Zap,
    features: ['Full feature access', 'Community support', 'Single user license', 'All automation tools'],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Standard',
    price: 999,
    period: 'per year',
    description: 'Perfect for small teams',
    icon: Shield,
    features: ['BOM Automation', 'PDF Merge + Index', 'Email support', 'Single user license', 'Quarterly updates'],
    cta: 'Get Standard',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: 1299,
    period: 'per year',
    description: 'Most popular choice',
    icon: Crown,
    features: [
      'All Standard features',
      'STEP/DXF Export',
      'Priority support',
      'Multi-user discount',
      'Monthly updates',
      'Custom templates',
    ],
    cta: 'Get Premium',
    highlighted: true,
    badge: 'MOST POPULAR',
  },
  {
    name: 'Premium Plus',
    price: 1599,
    period: 'per year',
    description: 'Enterprise solution',
    icon: Star,
    features: [
      'All Premium features',
      'Custom development',
      'Dedicated support',
      'Training sessions',
      'API access',
      'White-label options',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const faqs = [
  {
    q: 'Can I try MetaMech before purchasing?',
    a: 'Yes! We offer a free 3-day trial with full access to all features. No credit card required.',
  },
  {
    q: 'What SolidWorks versions are supported?',
    a: 'MetaMech supports SolidWorks 2018 and later versions on Windows.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Absolutely. You can upgrade or downgrade your plan at any time. We\'ll prorate the difference.',
  },
  {
    q: 'Is there a money-back guarantee?',
    a: 'Yes, all plans include a 14-day money-back guarantee. No questions asked.',
  },
  {
    q: 'Do you offer volume discounts?',
    a: 'Yes. For teams of 5+ engineers, contact us for custom pricing and multi-user discounts.',
  },
];

export default function PricingPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://metamechsolutions.com' },
      { '@type': 'ListItem', position: 2, name: 'Pricing', item: 'https://metamechsolutions.com/pricing' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <AnimatedPricingContent>
      {/* Pricing Cards */}
      <section className="relative py-20 lg:py-32 overflow-hidden pt-[100px]">
        <div className="absolute inset-0 bg-navy">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-teal/5 rounded-full blur-[200px]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-7xl xl:max-w-8xl 2xl:max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <Breadcrumbs items={[{ name: 'Pricing' }]} />

          <div className="text-center mb-16">
            <h1 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              CHOOSE YOUR <span className="text-gradient-teal">PLAN</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Flexible pricing options to fit teams of any size. All plans include core automation features.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div key={index} data-animate="plan-card" className={`relative group ${plan.highlighted ? 'lg:-mt-4 lg:mb-4' : ''}`}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-4 py-1 bg-gradient-to-r from-gold to-amber-500 rounded-full text-xs font-bold text-navy shadow-glow-gold">
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div
                  className={`h-full glass-card p-6 transition-all duration-300 hover:-translate-y-4 ${
                    plan.highlighted
                      ? 'border-cyan-500/50 shadow-glow-teal hover:shadow-glow-teal-lg'
                      : 'hover:border-cyan-500/30 hover:shadow-card-hover'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${
                      plan.highlighted ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white' : 'bg-white/10 text-cyan-400'
                    }`}
                  >
                    <plan.icon size={24} />
                  </div>

                  <h2 className="font-orbitron text-xl font-bold text-white mb-1">{plan.name}</h2>
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">€{plan.price}</span>
                      <span className="text-gray-500 text-sm">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2 text-sm text-gray-400">
                        <Check size={16} className={`mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-cyan-400' : 'text-gray-500'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#checkout"
                    className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                      plan.highlighted
                        ? 'btn-primary'
                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-cyan-500/50'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">All plans include a 14-day money-back guarantee. No questions asked.</p>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-navy">
          <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-teal/5 rounded-full blur-[200px] -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px] -translate-y-1/2" />
        </div>

        <div className="relative z-10 max-w-7xl xl:max-w-8xl 2xl:max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              CALCULATE YOUR <span className="text-gradient-gold">ROI</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              See how much time and money MetaMech can save your engineering team.
            </p>
          </div>
          <div data-animate="roi"><ROICalculator /></div>
        </div>
      </section>

      {/* Checkout */}
      <section id="checkout" className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-navy">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal/5 rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-3xl xl:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              COMPLETE YOUR <span className="text-gradient-gold">ORDER</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              You&apos;re almost there. Fill in your details to proceed with payment.
            </p>
          </div>
          <div data-animate="checkout"><CheckoutForm /></div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-navy" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">
              FREQUENTLY ASKED <span className="text-gradient-teal">QUESTIONS</span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} data-animate="faq" className="glass-card p-6">
                <h3 className="font-orbitron text-sm font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </AnimatedPricingContent>
    </>
  );
}
