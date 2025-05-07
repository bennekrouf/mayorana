import React from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { FaCode, FaBrain, FaRobot, FaArrowRight } from 'react-icons/fa';
import { FaNetworkWired } from "react-icons/fa";
import { motion } from 'framer-motion';

const ServicesPage: React.FC = () => {
  const services = [
    {
      id: "rust-training",
      icon: <FaCode className="h-8 w-8 text-primary" />,
      title: "Rust Training",
      description: "Expert-led Rust training for professionals and teams, covering memory safety, concurrency, and performance optimization. Tailored courses for beginners to advanced developers, with real-world applications in fintech, systems programming, and more.",
      benefits: [
        "Master Rust's ownership system and memory safety features",
        "Learn concurrent programming patterns with Rust's guarantees",
        "Understand performance optimization techniques",
        "Apply Rust to real-world problems in your domain"
      ],
      cta: "Schedule a Training Session",
      link: "/contact?service=rust-training"
    },
    {
      id: "llm-integration",
      icon: <FaBrain className="h-8 w-8 text-primary" />,
      title: "LLM Integration",
      description: "Seamlessly connect large language models (LLMs) to your applications for enhanced automation, chatbots, and data processing. Custom solutions designed to integrate with your existing systems, ensuring scalability and performance.",
      benefits: [
        "Integrate leading LLMs into your existing products",
        "Build custom knowledge bases for domain-specific applications",
        "Implement scalable prompt engineering frameworks",
        "Create robust evaluation systems for LLM outputs"
      ],
      cta: "Get a Free Consultation",
      link: "/contact?service=llm-integration"
    },
    {
      id: "ai-agent",
      icon: <FaRobot className="h-8 w-8 text-primary" />,
      title: "AI Agent Development",
      description: "Build intelligent AI agents for automation, decision-making, and process optimization. From concept to deployment, I create agents that leverage NLP and gRPC for enterprise-grade performance.",
      benefits: [
        "Automate complex workflows with intelligent agents",
        "Create agents that can reason about your domain",
        "Connect to multiple data sources and APIs",
        "Build self-improving systems with feedback loops"
      ],
      cta: "Start Your Agent Project",
      link: "/contact?service=ai-agent"
    },
    {
      id: "api0",
      icon: <FaNetworkWired className="h-8 w-8 text-primary" />,
      title: "api0.ai Solutions",
      description: "Promote api0.ai, my cutting-edge platform that uses advanced NLP to match user inputs to API endpoints, simplifying integrations for enterprises. Easy-to-use, secure, and designed for minimal setup.",
      benefits: [
        "Match natural language inputs to the right API endpoints",
        "Reduce integration time and complexity",
        "Secure API key management with domain restrictions",
        "Scale seamlessly for enterprise-level traffic"
      ],
      cta: "Try api0.ai Now",
      link: "https://api0.ai"
    }
  ];

  return (
    <Layout title="Services | Mayorana">
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
              What I Offer
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Specialized services that help businesses innovate and transform through modern technology solutions.
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
                      <h3 className="font-semibold mb-4">Key Benefits</h3>
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
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contact me to discuss your specific needs and how my services can help your business innovate and grow.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold hover:bg-primary/90 transform transition duration-200 hover:-translate-y-1 shadow-xl shadow-primary/20"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
