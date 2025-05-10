import React from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import BlogList from '../components/blog/BlogList';
// Import only the specific icons you need
import { FaBrain } from 'react-icons/fa';
import { FaCode } from 'react-icons/fa';
import { FaNetworkWired } from "react-icons/fa";
import { FaRobot } from 'react-icons/fa';

import { motion } from 'framer-motion';
import { getRecentPosts, BlogPost } from '../lib/blog';


interface HomePageProps {
  recentPosts?: BlogPost[];
}

const HomePage: React.FC<HomePageProps> = ({ recentPosts = getRecentPosts(3) }) => {
  const services = [
    {
      icon: <FaCode className="h-8 w-8 text-primary" />,
      title: "Rust Training",
      description: "Expert-led Rust training for professionals and teams, covering memory safety, concurrency, and performance optimization.",
      cta: "Schedule a Training Session",
      link: "/contact?service=rust-training"
    },
    {
      icon: <FaBrain className="h-8 w-8 text-primary" />,
      title: "LLM Integration",
      description: "Seamlessly connect large language models (LLMs) to your applications for enhanced automation, chatbots, and data processing.",
      cta: "Get a Free Consultation",
      link: "/contact?service=llm-integration"
    },
    {
      icon: <FaRobot className="h-8 w-8 text-primary" />,
      title: "AI Agent Development",
      description: "Build intelligent AI agents for automation, decision-making, and process optimization.",
      cta: "Start Your Agent Project",
      link: "/contact?service=ai-agent"
    },
    {
      icon: <FaNetworkWired className="h-8 w-8 text-primary" />,
      title: "api0.ai Solutions",
      description: "Cutting-edge platform that uses advanced NLP to match user inputs to API endpoints, simplifying integrations.",
      cta: "Try api0.ai Now",
      link: "https://api0.ai"
    }
  ];

  const testimonials = [
    {
      quote: "The Rust training was transformative for our team. Clear, practical, and perfectly tailored to our needs.",
      author: "Fintech Lead, Zurich"
    },
    {
      quote: "api0.ai made our API integrations effortless. It's a game-changer for our platform.",
      author: "E-commerce CTO"
    }
  ];

  const portfolio = [
    {
      title: "Rust Training for Java Developers",
      description: "Delivering hands-on Rust training programs tailored for Java developers, enabling them to master Rust with the same fluency as Java.",
      category: "Training"
    },
    {
      title: "LLM-Powered Chatbot",
      description: "Integrated an LLM into a client's customer service platform, reducing response times by 40%.",
      category: "Integration"
    },
    {
      title: "api0.ai Implementation",
      description: "Helped an e-commerce client map user queries to product APIs, cutting integration time by 50%.",
      category: "Development"
    }
  ];

  return (
    <Layout>
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
              Building Smarter Solutions with Rust, AI, and APIs
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Specialized in Rust training, LLM integration, and AI agent development for businesses across Switzerland and beyond.
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
                Discover api0.ai
              </Link>
              <Link
                href="/contact?service=rust-training"
                className="inline-flex items-center px-8 py-4 rounded-lg bg-foreground text-background text-lg font-semibold hover:bg-foreground/90 transform transition duration-200 hover:-translate-y-1"
              >
                Book a Rust Training
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What I Offer</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Specialized services that help businesses innovate and transform through modern technology solutions.
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
              <h2 className="text-3xl font-bold mb-6">Discover api0.ai</h2>
              <p className="text-lg text-muted-foreground mb-6">
                api0.ai is my flagship solution for enterprises looking to streamline API integrations. Using advanced NLP, it intelligently matches user sentences to the right API endpoints, reducing development time and complexity.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>Minimal setup with JavaScript SDK</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>Secure API key management</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-3 text-primary">✓</div>
                  <span>Scalable for enterprise needs</span>
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
            <h2 className="text-3xl font-bold mb-4">My Work</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Showcasing successful projects and collaborations across Switzerland and beyond.
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
              href="/contact"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              Contact Me for Custom Solutions
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Clients Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The experiences of those who have benefited from my services.
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

      {/* Blog Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Latest Insights</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Thoughts and tutorials on Rust, LLM integration, and AI agent development.
            </p>
          </div>
          <BlogList posts={recentPosts} />
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              View All Articles
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Elevate Your Tech Stack?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contact me for Rust training, LLM integration, or custom solutions that drive innovation and efficiency.
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

export default HomePage;
