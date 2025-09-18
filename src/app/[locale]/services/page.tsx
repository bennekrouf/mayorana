'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { FaCode, FaBrain, FaCommentDots, FaArrowRight } from 'react-icons/fa';
import { FaNetworkWired } from "react-icons/fa";
import { motion } from '@/components/ui/Motion';
import { useLocale } from 'next-intl';

export default function ServicesPage() {
  const locale = useLocale();

  const services = [
    {
      id: "rust-training",
      icon: <FaCode className="h-8 w-8 text-primary" />,
      title: "Rust Adoption & Training",
      description: "Help your team transition from Java, C++, or other languages to Rust with guided training and migration strategies.",
      approach: [
        "Assessment of current codebase and team skills",
        "Hands-on training workshops tailored to your domain",
        "Migration strategy planning for existing applications",
        "Code review and mentoring during transition"
      ],
      cta: "Start Your Rust Journey",
      link: `/${locale}/contact?service=rust-training`
    },
    {
      id: "llm-integration",
      icon: <FaBrain className="h-8 w-8 text-primary" />,
      title: "LLM Integration",
      description: "Connect LLMs like GPT, Claude, or open-source models to your applications for enhanced automation and data processing.",
      approach: [
        "API integration with leading LLM providers",
        "Custom prompt engineering and optimization",
        "RAG (Retrieval Augmented Generation) implementation",
        "Performance monitoring and cost optimization"
      ],
      cta: "Get Free Consultation",
      link: `/${locale}/contact?service=llm-integration`
    },
    {
      id: "chatbot",
      icon: <FaCommentDots className="h-8 w-8 text-primary" />,
      title: "Chatbot Development",
      description: "Build intelligent chatbots that connect to your existing APIs and understand your business context.",
      approach: [
        "Natural language understanding for your domain",
        "Integration with existing APIs and databases",
        "Multi-turn conversation handling",
        "Deployment on web, Slack, or custom platforms"
      ],
      cta: "Add Chat to Your App",
      link: `/${locale}/contact?service=chatbot`
    },
    {
      id: "api0",
      icon: <FaNetworkWired className="h-8 w-8 text-primary" />,
      title: "api0.ai Solutions",
      description: "My flagship NLP platform that automatically matches user inputs to your API endpoints, eliminating complex routing logic.",
      approach: [
        "NLP-powered endpoint matching",
        "Secure API key management",
        "Domain-restricted access control",
        "Enterprise-grade scaling and monitoring"
      ],
      cta: "Try api0.ai",
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
              Services
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Specialized technology consulting focused on Rust, AI, and API solutions
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
                      <h3 className="font-semibold mb-4">My Approach</h3>
                      <ul className="space-y-4">
                        {service.approach.map((item, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-3 text-primary font-bold">•</span>
                            <span>{item}</span>
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
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              How I can help your business succeed with modern technology
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
