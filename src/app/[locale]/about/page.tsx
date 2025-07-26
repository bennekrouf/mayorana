'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { FiExternalLink } from 'react-icons/fi';
import { motion } from '@/components/ui/Motion';

export default function AboutPage() {
  const skills = [
    { category: "Programming", items: ["Rust", "TypeScript", "Python", "WebAssembly"] },
    { category: "AI & ML", items: ["LLM Integration", "NLP", "AI Agent Development", "Prompt Engineering"] },
    { category: "Infrastructure", items: ["AWS", "Docker", "Kubernetes", "gRPC"] },
    { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "WebSockets"] }
  ];

  const values = [
    {
      title: "Technical Excellence",
      description: "Building robust, performant, and maintainable systems that stand the test of time."
    },
    {
      title: "Continuous Learning",
      description: "Staying at the forefront of technology to deliver cutting-edge solutions."
    },
    {
      title: "Client Success",
      description: "Focusing on outcomes that drive real business value and innovation."
    },
    {
      title: "Simplicity",
      description: "Creating elegant solutions that reduce complexity and are easy to understand."
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
              About Me
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Bringing expertise in Rust, AI agents, and API solutions to clients worldwide
            </motion.p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              className="relative h-96 rounded-xl overflow-hidden border border-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Placeholder for profile image */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                <span className="text-4xl font-bold text-foreground">Mayorana</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6">Who I Am</h2>
              <div className="space-y-4 text-lg">
                <p>
                  As a solopreneur based in Switzerland, I specialize in delivering cutting-edge solutions in Rust programming, AI agent development, and seamless LLM integrations.
                </p>
                <p>
                  With a passion for simplifying complex systems, I empower businesses through tailored Rust training and innovative tools like api0.ai, my NLP-driven API-matching solution.
                </p>
                <p>
                  My work blends technical expertise with a commitment to driving efficiency and innovation for enterprises worldwide.
                </p>
                <p className="font-medium text-foreground">
                  Proudly operating from the heart of Switzerland, I bring precision and reliability to every project.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Skills Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-10 text-center">Skills & Expertise</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {skills.map((skillGroup) => (
                <div 
                  key={skillGroup.category}
                  className="p-6 bg-secondary rounded-xl border border-border"
                >
                  <h3 className="font-semibold mb-4 text-primary">{skillGroup.category}</h3>
                  <ul className="space-y-2">
                    {skillGroup.items.map((skill) => (
                      <li key={skill} className="flex items-center">
                        <span className="mr-2">•</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-10 text-center">Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div 
                  key={value.title}
                  className="p-6 rounded-xl bg-secondary/50 border border-border"
                >
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* api0.ai Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Project: api0.ai</h2>
              <p className="text-lg text-muted-foreground">
                My flagship innovation, streamlining API integrations through advanced NLP
              </p>
            </div>
            
            <div className="bg-background p-8 rounded-xl border border-border mb-10">
              <p className="mb-6">
                api0.ai represents the culmination of my work in AI and API integration, providing a solution that intelligently matches natural language inputs to the right API endpoints.
              </p>
              <p className="mb-6">
                Using advanced natural language processing, api0.ai simplifies the integration process for businesses, reducing development time and complexity while providing robust security features.
              </p>
              <div className="flex justify-center">
                <Link
                  href="https://api0.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                >
                  Visit api0.ai <FiExternalLink className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Work Together?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Let&apos;s discuss how my expertise can help your business achieve its goals with innovative technology solutions.
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
    </LayoutTemplate>
  );
}
