import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { getLocalizedPath } from '@/lib/i18n-utils';
import { useLocale, useTranslations } from 'next-intl';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const tNav = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const portfolioLinks = [
    { name: t('footer_api0'), url: 'https://api0.ai', external: true },
    { name: t('footer_solanize'), url: 'https://ribh.io', external: true }
  ];

  const actionLinks = [
    { name: t('footer_book_call'), url: getLocalizedPath(locale, '/contact'), external: false },
    { name: t('footer_whatsapp'), url: 'https://wa.me/41764837540', external: true }
  ];

  const navigationLinks = [
    { name: tNav('home'), url: getLocalizedPath(locale, '/') },
    { name: tNav('about'), url: getLocalizedPath(locale, '/about') },
    { name: tNav('contact'), url: getLocalizedPath(locale, '/contact') },
    { name: tNav('blog'), url: getLocalizedPath(locale, '/blog') }
  ];

  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href={getLocalizedPath(locale, '/')}
              className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Mayorana
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              {t('footer_tagline')}
            </p>
            <div className="mt-4">
              <Link
                href={locale === 'en' ? '/fr' : '/en'}
                className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-background hover:bg-background/80 transition-colors border border-border"
              >
                {locale === 'en' ? 'Français' : 'English'}
              </Link>
            </div>
          </div>

          {/* Portfolio Tools */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Live Portfolio</h3>
            <ul className="space-y-3">
              {portfolioLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.url}
                    target={link.external ? "_blank" : "_self"}
                    rel={link.external ? "noopener noreferrer" : ""}
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    {link.name}
                    {link.external && (
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="https://cvenom.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  cVenom
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="https://ribh.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  Solanize
                  <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-0.5 rounded ml-1">
                    MVP
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Navigation</h3>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.url}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Actions */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Get Started</h3>
            <ul className="space-y-3">
              {actionLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.url}
                    target={link.external ? "_blank" : "_self"}
                    rel={link.external ? "noopener noreferrer" : ""}
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    {link.name}
                    {link.external && (
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <div className="mt-6">
              <Link
                href={getLocalizedPath(locale, '/contact')}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                {tCommon('cta_button')}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Mayorana. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link
                href={getLocalizedPath(locale, '/privacy')}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy
              </Link>
              <Link
                href={getLocalizedPath(locale, '/terms')}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms
              </Link>
              <span className="text-muted-foreground">
                Built with Rust + Next.js
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
