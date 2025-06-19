'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from 'next-themes';

const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // Navigation items from config
  const navItems = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    { label: "Blog", path: "/blog" },
    { label: "About", path: "/about" },
    { label: "api0.ai", path: "https://api0.ai", external: true },
    { label: "Contact", path: "/contact" }
  ];

  // After mounting, we can safely access the theme
  useEffect(() => setMounted(true), []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Helper function to check if a link is active
  const isLinkActive = (path: string) => {
    // Remove trailing slash from pathname for comparison
    const currentPath = pathname.replace(/\/$/, '');
    const normalizedPath = path.replace(/\/$/, '');
    return currentPath === normalizedPath;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            {/* Simple text logo instead of image */}
            <span className="font-bold text-xl text-foreground">mayorana</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              target={item.external ? "_blank" : "_self"}
              rel={item.external ? "noopener noreferrer" : ""}
              className={`text-sm font-medium transition-colors hover:text-primary ${isLinkActive(item.path) ? "text-primary" : "text-foreground"
                }`}
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={toggleTheme}
            className="rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Toggle Theme"
          >
            {mounted && theme === 'dark' ? (
              <FiSun className="h-5 w-5" />
            ) : (
              <FiMoon className="h-5 w-5" />
            )}
          </button>

          <Link
            href="/contact"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition duration-200 hover:-translate-y-1 shadow-lg shadow-primary/20"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden">
          <button
            onClick={toggleTheme}
            className="mr-4 rounded-full p-2 bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Toggle Theme"
          >
            {mounted && theme === 'dark' ? (
              <FiSun className="h-5 w-5" />
            ) : (
              <FiMoon className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-foreground"
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="container py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.path}
                target={item.external ? "_blank" : "_self"}
                rel={item.external ? "noopener noreferrer" : ""}
                className={`block px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${isLinkActive(item.path) ? "text-primary" : "text-foreground"
                  }`}
                onClick={toggleMenu}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="block px-4 py-2 mt-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
              onClick={toggleMenu}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
