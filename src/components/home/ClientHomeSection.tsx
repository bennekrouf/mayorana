'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from '@/components/ui/Motion';
import { FaBrain, FaCode, FaNetworkWired, FaRobot } from 'react-icons/fa';
import { useTranslations, useLocale } from 'next-intl';

export default function ClientHomeSection() {
  const t = useTranslations('home');
  const tServices = useTranslations('services');
  const tTestimonials = useTranslations('testimonials');
  const tPortfolio = useTranslations('portfolio');
  const locale = useLocale();

  // Helper function to get localized path
  const getLocalizedPath = (path: string) => {
    if (locale === 'en') return path;
    return `/${locale}${path}`;
  };

  const services = [
    {
      icon: <FaCode className="h-8 w-8 text-primary" />,
      title: tServices('rust_training.title'),
      description: tServices('rust_training.description'),
      cta: tServices('rust_training.cta'),
      link: getLocalizedPath("/contact?service=rust-training")
    },
    {
      icon: <FaBrain className="h-8 w-8 text-primary" />,
      title: tServices('llm_integration.title'),
      description: tServices('llm_integration.description'),
      cta: tServices('llm_integration.cta'),
      link: getLocalizedPath("/contact?service=llm-integration")
    },
    {
      icon: <FaRobot className="h-8 w-8 text-primary" />,
      title: tServices('ai_agent.title'),
      description: tServices('ai_agent.description'),
      cta: tServices('ai_agent.cta'),
      link: getLocalizedPath("/contact?service=ai-agent")
    },
    {
      icon: <FaNetworkWired className="h-8 w-8 text-primary" />,
      title: tServices('api0.title'),
      description: tServices('api0.description'),
      cta: tServices('api0.cta'),
      link: "https://api0.ai"
    }
  ];

  const testimonials = [
    {
      quote: tTestimonials('fintech_lead.quote'),
      author: tTestimonials('fintech_lead.author')
    },
    {
      quote: tTestimonials('ecommerce_cto.quote'),
      author: tTestimonials('ecommerce_cto.author')
    }
  ];

  const portfolio = [
    {
      title: tPortfolio('rust_training_java.title'),
      description: tPortfolio('rust_training_java.description'),
      category: tPortfolio('rust_training_java.category')
    },
    {
      title: tPortfolio('llm_chatbot.title'),
      description: tPortfolio('llm_chatbot.description'),
      category: tPortfolio('llm_chatbot.category')
    },
    {
      title: tPortfolio('api0_implementation.title'),
      description: tPortfolio('api0_implementation.description'),
      category: tPortfolio('api0_implementation.category')
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
                href={getLocalizedPath("/contact?service=rust-training")}
                className="inline-flex items-center px-8 py-4 rounded-lg bg-foreground text-background text-lg font-semibold hover:bg-foreground/90 transform transition duration-200 hover:-translate-y-1"
              >
                {t('book_rust_training')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('what_i_offer')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('services_subtitle')}
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
                {t('api0_description')}
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>{t('api0_feature1')}</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>{t('api0_feature2')}</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>{t('api0_feature3')}</span>
                </li>
              </ul>
              <Link
                href="https://api0.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-lg shadow-primary/20"
              >
                {t('explore_api0')}
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
                    <span className="text-blue-600">const</span> <span className="text-green-600">api0</span> = <span className="text-blue-600">await</span> Api0.<span className="text-purple-600">initialize</span>({"{"}
                    <br />
                    &nbsp;&nbsp;apiKey: <span className="text-orange-600">&ldquo;your-api-key&rdquo;</span>,
                    <br />
                    &nbsp;&nbsp;domainRestriction: <span className="text-orange-600">&ldquo;yourcompany.com&rdquo;</span>
                    <br />
                    {"}"});
                    <br /><br />
                    <span className="text-blue-600">const</span> <span className="text-green-600">result</span> = <span className="text-blue-600">await</span> api0.<span className="text-purple-600">match</span>({"{"}
                    <br />
                    &nbsp;&nbsp;input: <span className="text-orange-600">&ldquo;Find products under $50&rdquo;</span>,
                    <br />
                    &nbsp;&nbsp;context: {"{"}...{"}"};
                    <br />
                    {"}"});
                  </code>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('my_work')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('work_subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {portfolio.map((item, index) => (
              <motion.div
                key={item.title}
                className="p-6 rounded-xl bg-secondary/50 border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mb-2 text-sm font-medium text-primary">
                  {item.category}
                </div>
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href={getLocalizedPath("/contact")}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              {t('contact_custom_solutions')}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('what_clients_say')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('testimonials_subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl bg-background border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="text-primary text-4xl mb-4">&ldquo;</div>
                <p className="text-foreground mb-6 italic">
                  {testimonial.quote}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  — {testimonial.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t('ready_elevate')}</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('cta_description')}
            </p>
            <Link
              href={getLocalizedPath("/contact")}
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              {t('get_in_touch')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
