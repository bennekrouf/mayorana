import React from 'react';
import Link from 'next/link';
import { FiLinkedin, FiGithub, FiMail } from 'react-icons/fi';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const footerNav = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    { label: "About", path: "/about" },
    { label: "api0.ai", path: "https://api0.ai", external: true },
    { label: "Contact", path: "/contact" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" }
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Column 1: Logo & Company Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl text-foreground">mayorana</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Specialized in Rust training, LLM integration, and AI agent development.
              Based in Switzerland, serving clients worldwide.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerNav.slice(0, 5).map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.path}
                    target={item.external ? "_blank" : "_self"}
                    rel={item.external ? "noopener noreferrer" : ""}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/services#rust-training"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Rust Training
                </Link>
              </li>
              <li>
                <Link
                  href="/services#llm-integration"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  LLM Integration
                </Link>
              </li>
              <li>
                <Link
                  href="/services#ai-agent"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  AI Agent Development
                </Link>
              </li>
              <li>
                <Link
                  href="https://api0.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  api0.ai Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <a
                href="https://linkedin.com/in/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <FiGithub className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@mayorana.ch"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <FiMail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Email: contact@mayorana.ch
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row md:justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Mayorana.ch. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">
            Based in Switzerland, Serving the World
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
