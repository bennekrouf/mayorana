'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { FaCode, FaBrain, FaCommentDots, FaArrowRight } from 'react-icons/fa';
import { FaNetworkWired } from "react-icons/fa";
import { motion } from '@/components/ui/Motion';
import { useTranslations, useLocale } from 'next-intl';

export default function ServicesPage() {
  const t = useTranslations('services');
  const tHome = useTranslations('home');
  const locale = useLocale();

  const services = [
    {
      id: "rust-training",
      icon: <FaCode className="h-8 w-8 text-primary" />,
      title: t('rust_training.title'),
      description: t('rust_training.description'),
      benefits: [
        t('rust_training.benefit1'),
        t('rust_training.benefit2'),
        t('rust_training.benefit3'),
        t('rust_training.benefit4')
      ],
      cta: t('rust_training.cta'),
      link: `/${locale}/contact?service=rust-training`
    },
    {
      id: "llm-integration",
      icon: <FaBrain className="h-8 w-8 text-primary" />,
      title: t('llm_integration.title'),
      description: t('llm_integration.description'),
      benefits: [
        t('llm_integration.benefit1'),
        t('llm_integration.benefit2'),
        t('llm_integration.benefit3'),
        t('llm_integration.benefit4')
      ],
      cta: t('llm_integration.cta'),
      link: `/${locale}/contact?service=llm-integration`
    },
    {
      id: "chatbot", // Changed from "ai-agent"
      icon: <FaCommentDots className="h-8 w-8 text-primary" />, // Change icon
      title: t('chatbot.title'), // Changed from ai_agent
      description: t('chatbot.description'),
      benefits: [
        t('chatbot.benefit1'),
        t('chatbot.benefit2'),
        t('chatbot.benefit3'),
        t('chatbot.benefit4')
      ],
      cta: t('chatbot.cta'),
      link: `/${locale}/contact?service=chatbot` // Changed from ai-agent
    },
    {
      id: "api0",
      icon: <FaNetworkWired className="h-8 w-8 text-primary" />,
      title: t('api0.title'),
      description: t('api0.description'),
      benefits: [
        t('api0.benefit1'),
        t('api0.benefit2'),
        t('api0.benefit3'),
        t('api0.benefit4')
      ],
      cta: t('api0.cta'),
      link: "https://api0.ai"
    }
  ];

  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {tHome('what_i_offer')}
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {tHome('services_subtitle')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="space-y-24">
            {services.map((service, index) => (
              <div
                key={service.id}
                id={service.id}
                className="scroll-mt-20"
              >
                <motion.div
                  className="grid md:grid-cols-2 gap-12 items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={index % 2 === 0 ? "order-1" : "order-1 md:order-2"}>
                    <div className="mb-6 p-4 inline-flex bg-primary/10 rounded-full">
                      {service.icon}
                    </div>
                    <h2 className="text-3xl font-bold mb-6">{service.title}</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                      {service.description}
                    </p>
                    <Link
                      href={service.link}
                      className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                    >
                      {service.cta} <FaArrowRight className="ml-2" />
                    </Link>
                  </div>

                  <div className={index % 2 === 0 ? "order-2" : "order-2 md:order-1"}>
                    <div className="bg-secondary p-8 rounded-xl border border-border">
                      <h3 className="font-semibold mb-4">{t('key_benefits')}</h3>
                      <ul className="space-y-4">
                        {service.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-3 text-primary font-bold">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t('ready_get_started')}</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('contact_description')}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              {tHome('get_in_touch')}
            </Link>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
