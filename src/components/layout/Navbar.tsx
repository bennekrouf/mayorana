'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiMoon, FiSun, FiGlobe } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-utils';

const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const locale = useLocale();

  // Navigation items - exactly like live site but with Portfolio instead of Services
  const navItems = [
    { name: t('home'), path: '/' },
    { name: 'Portfolio', path: '/#portfolio' },
    // { name: t('about'), path: '/about' },
    { name: t('blog'), path: '/blog' },
    // { name: 'api0.ai', path: 'https://api0.ai', external: true },
    { name: t('contact'), path: '/contact' }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActivePath = (path: string) => {
    if (path === '/') {
      return pathname === `/${locale}` || pathname === '/' || pathname === `/${locale}/`;
    }
    if (path.startsWith('/#')) {
      return false; // Portfolio anchor link should not be highlighted on homepage
    }
    return pathname.includes(path);
  };

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo - exactly like live site */}
          <Link href={getLocalizedPath(locale, '/')} className="font-bold text-xl">
            Mayorana
          </Link>

          {/* Desktop Navigation - exactly like live site layout */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.path.startsWith('/#') ? (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('portfolio');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`transition-colors font-medium ${isActivePath(item.path)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.path}
                  href={getLocalizedPath(locale, item.path)}
                  className={`transition-colors font-medium ${isActivePath(item.path)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* Right side controls - exactly like live site */}
          <div className="hidden md:flex items-center space-x-4">

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label={t('toggle_theme')}
            >
              {theme === 'dark' ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => {
                const newLocale = locale === 'fr' ? 'en' : 'fr';
                const newPath = pathname.replace(/^\/[a-z]{2}/, `/${newLocale}`);
                window.location.href = newPath;
              }}
              className="rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors flex items-center w-[60px] justify-center"
              aria-label="Toggle language"
            >
              <FiGlobe size={16} className="mr-1 flex-shrink-0" />
              <span className="text-sm font-medium">{locale.toUpperCase()}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={t('toggle_menu')}
          >
            {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu - exactly like live site */}
        {isOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="py-4 space-y-2">
              {navItems.map((item) => (
                item.path.startsWith('/#') ? (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById('portfolio');
                      if (element) {
                        const navbarHeight = 64; // 16 * 4 = 64px (h-16 class)
                        const elementPosition = element.offsetTop - navbarHeight + 50;
                        window.scrollTo({
                          top: elementPosition,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className={`block px-4 py-2 transition-colors ${isActivePath(item.path)
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.path}
                    href={getLocalizedPath(locale, item.path)}
                    className={`block px-4 py-2 transition-colors ${isActivePath(item.path)
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}

              {/* Mobile controls */}
              <div className="px-4 py-2 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {theme === 'dark' ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => {
                    const newLocale = locale === 'fr' ? 'en' : 'fr';
                    const newPath = pathname.replace(/^\/[a-z]{2}/, `/${newLocale}`);
                    window.location.href = newPath;
                  }}
                  className="px-4 py-2 text-sm rounded bg-secondary hover:bg-secondary/80 transition-colors flex items-center"
                >
                  <FiGlobe size={16} className="mr-2" />
                  {locale === 'en' ? 'Switch to FR' : 'Passer en EN'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
