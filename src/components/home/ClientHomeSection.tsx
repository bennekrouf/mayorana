'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from '@/components/ui/Motion';
import { FaBrain, FaCode, FaNetworkWired, FaCommentDots } from 'react-icons/fa';
import { useTranslations, useLocale } from 'next-intl';

export default function ClientHomeSection() {
  const t = useTranslations('home');
  const tServices = useTranslations('services');
  const locale = useLocale();

  // Helper function to get localized path
  const getLocalizedPath = (path: string) => {
    return `/${locale}${path}`;
  };

  const services = [
    {
      icon: <FaCode className="h-8 w-8 text-primary" />,
      title: tServices('rust_training.title'),
      description: "Help your team adopt Rust with guided training and migration strategies",
      cta: "Start Your Rust Journey",
      link: `${getLocalizedPath("/contact")}?service=rust-training`
    },
    {
      icon: <FaBrain className="h-8 w-8 text-primary" />,
      title: tServices('llm_integration.title'),
      description: "Connect LLMs to your applications for enhanced automation and chatbots",
      cta: "Get Free Consultation",
      link: getLocalizedPath("/contact?service=llm-integration")
    },
    {
      icon: <FaCommentDots className="h-8 w-8 text-primary" />,
      title: tServices('chatbot.title'),
      description: "Build intelligent chatbots that understand your business context",
      cta: "Add Chat to Your App",
      link: getLocalizedPath("/contact?service=chatbot")
    },
    {
      icon: <FaNetworkWired className="h-8 w-8 text-primary" />,
      title: tServices('api0.title'),
      description: "Smart NLP-powered API matching platform for seamless integrations",
      cta: "Try api0.ai",
      link: "https://api0.ai"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('hero_title')}
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('hero_subtitle')}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link
                href="https://api0.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
              >
                {t('discover_api0')}
              </Link>
              <Link
                href={getLocalizedPath("/contact")}
                className="inline-flex items-center px-8 py-4 rounded-lg bg-foreground text-background text-lg font-semibold hover:bg-foreground/90 transform transition duration-200 hover:-translate-y-1"
              >
                Get in Touch
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section - Streamlined */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What I Offer</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Specialized services that help businesses adopt modern technology solutions
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-secondary/50 border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mb-6 p-4 bg-primary/10 rounded-full">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                <p className="text-muted-foreground mb-6">{service.description}</p>
                <Link
                  href={service.link}
                  className="text-primary font-medium hover:underline mt-auto"
                >
                  {service.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* api0.ai Spotlight */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6">{t('discover_api0_title')}</h2>
              <p className="text-lg text-muted-foreground mb-6">
                My flagship solution that uses advanced NLP to match user inputs to API endpoints,
                reducing integration complexity for businesses.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>Minimal setup with JavaScript SDK</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>Secure API key management with domain restrictions</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>Scalable for enterprise traffic</span>
                </li>
              </ul>
              <Link
                href="https://api0.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-lg shadow-primary/20"
              >
                Explore api0.ai
              </Link>
            </motion.div>
            <motion.div
              className="relative h-80 w-full rounded-xl overflow-hidden shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-background/80 backdrop-blur-sm p-6 rounded-xl border border-border max-w-md">
                  <code className="text-sm block font-mono">
                    <span className="text-blue-600">const</span> <span className="text-green-600">api0</span> = <span className="text-blue-600">await</span> Api0.<span className="text-purple-600">initialize</span>({`{`}
                    <br />
                    &nbsp;&nbsp;apiKey: <span className="text-orange-600">&quot;your-api-key&quot;</span>,
                    <br />
                    &nbsp;&nbsp;domain: <span className="text-orange-600">&quot;yourcompany.com&quot;</span>
                    <br />
                    {`}`});
                  </code>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Let&apos;s discuss how my expertise can help your business achieve its technology goals
            </p>
            <Link
              href={getLocalizedPath("/contact")}
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
