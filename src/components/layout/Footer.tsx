// File: src/components/layout/Footer.tsx (u// File: src/components/layout/Footer.tsx - Fixed JSX comment issue
'use client';

import React from 'react';
import Link from 'next/link';
import { FiLinkedin, FiGithub, FiMail } from 'react-icons/fi';
import { useTranslations, useLocale } from 'next-intl';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const tNav = useTranslations('navigation');
  const tServices = useTranslations('services');
  const locale = useLocale();

  // Helper function to get localized path
  const getLocalizedPath = (path: string) => {
    if (locale === 'en') return path;
    return `/${locale}${path}`;
  };

  const footerNav = [
    { label: tNav('home'), path: "/" },
    { label: tNav('services'), path: "/services" },
    { label: tNav('about'), path: "/about" },
    { label: "api0.ai", path: "https://api0.ai", external: true },
    { label: tNav('contact'), path: "/contact" }
  ];

  const legalLinks = [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" }
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Column 1: Logo & Company Description */}
          <div className="space-y-4">
            <Link href={getLocalizedPath("/")} className="flex items-center space-x-2">
              <span className="font-bold text-xl text-foreground">mayorana</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {t('description')}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">{t('quick_links')}</h3>
            <ul className="space-y-2">
              {footerNav.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.external ? item.path : getLocalizedPath(item.path)}
                    target={item.external ? "_blank" : "_self"}
                    rel={item.external ? "noopener noreferrer" : ""}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              <li className="pt-2 border-t border-border mt-4">
                {legalLinks.map((item) => (
                  <div key={item.label} className="mb-2">
                    <Link
                      href={getLocalizedPath(item.path)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="font-medium text-foreground mb-4">{t('services')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={getLocalizedPath("/services#rust-training")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {tServices('rust_training.title')}
                </Link>
              </li>
              <li>
                <Link
                  href={getLocalizedPath("/services#llm-integration")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {tServices('llm_integration.title')}
                </Link>
              </li>
              <li>
                <Link
                  href={getLocalizedPath("/services#chatbot")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {tServices('chatbot.title')}
                </Link>
              </li>
              <li>
                <Link
                  href="https://api0.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {tServices('api0.title')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h3 className="font-medium text-foreground mb-4">{t('connect')}</h3>
            <div className="flex space-x-4 mb-4">
              <a
                href="https://linkedin.com/company/mayorana"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/bennekrouf"
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
              {t('email_label')} contact@mayorana.ch
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row md:justify-between items-center">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Mayorana.ch. {t('copyright')}
            </p>
            <div className="flex space-x-4 text-xs text-muted-foreground">
              <Link href={getLocalizedPath("/privacy")} className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href={getLocalizedPath("/terms")} className="hover:text-primary transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">
            {t('tagline')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
