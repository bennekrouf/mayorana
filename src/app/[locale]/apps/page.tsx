'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';
import { FaGithub, FaApple, FaLinux, FaWindows } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { Brain, Shield, Zap, Code, ExternalLink, ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-utils';

interface WebApp {
  name: string;
  description: string;
  tech: string;
  url: string;
  status: 'live' | 'mvp' | 'coming_soon';
  cta: string;
  icon: React.ReactNode;
}

interface DownloadLink {
  os: 'mac' | 'linux' | 'windows';
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface DesktopApp {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tech: string;
  status: 'live' | 'beta' | 'wip';
  github: string;
  downloads: DownloadLink[];
}

const runner  = 'https://github.com/Bennekrouf/ais-runner';
const monitor = 'https://github.com/Bennekrouf/ais-monitor';
const blogtk = 'https://github.com/Bennekrouf/blog-toolkit';
const screens = 'https://github.com/bennekrouf/appscreens';

const desktopApps: DesktopApp[] = [
  {
    id: 'ais-runner',
    name: 'AIS Runner',
    tagline: 'Azure Integration Services — local development desktop',
    description:
      'Run and test Azure Logic Apps locally without pushing to Azure. ' +
      'One-click Azurite + func start, live run history, workflow analysis bar, ' +
      'Service Bus queue counts, CI/CD DevOps view, Liquid template tester, ' +
      'and workflow chain graph — all in one desktop app.',
    tech: 'Rust · Dioxus · Azure CLI · Azurite · Azure Functions',
    status: 'live',
    github: runner,
    downloads: [
      {
        os: 'mac',
        label: 'macOS (Apple Silicon)',
        href: `${runner}/releases/latest/download/ais-runner-macos-arm64.tar.gz`,
        icon: <FaApple className="w-4 h-4" />,
      },
      {
        os: 'linux',
        label: 'Linux x86_64',
        href: `${runner}/releases/latest/download/ais-runner-linux-x86_64.tar.gz`,
        icon: <FaLinux className="w-4 h-4" />,
      },
      {
        os: 'windows',
        label: 'Windows',
        href: `${runner}/releases/latest/download/ais-runner-setup.exe`,
        icon: <FaWindows className="w-4 h-4" />,
      },
    ],
  },
  {
    id: 'ais-monitor',
    name: 'AIS Monitor',
    tagline: 'Azure Logic Apps workflow chain explorer',
    description:
      'Visualise how your Logic Apps connect to each other via Service Bus queues ' +
      'and Event Grid, inspect live run history per chain, trigger HTTP workflows ' +
      'with saved payloads, and monitor deployed workflow states — ' +
      'all from a single desktop view.',
    tech: 'Rust · Dioxus · Azure CLI · ais-chain · D3.js',
    status: 'beta',
    github: monitor,
    downloads: [
      {
        os: 'mac',
        label: 'macOS (Apple Silicon)',
        href: `${monitor}/releases/latest/download/ais-monitor-macos-arm64.tar.gz`,
        icon: <FaApple className="w-4 h-4" />,
      },
      {
        os: 'linux',
        label: 'Linux x86_64',
        href: `${monitor}/releases/latest/download/ais-monitor-linux-x86_64.tar.gz`,
        icon: <FaLinux className="w-4 h-4" />,
      },
      {
        os: 'windows',
        label: 'Windows',
        href: `${monitor}/releases/latest/download/ais-monitor-setup.exe`,
        icon: <FaWindows className="w-4 h-4" />,
      },
    ],
  },
  {
    id: 'blog-toolkit',
    name: 'Blog Toolkit',
    tagline: 'AI-powered blog post manager with queue-to-publish workflow',
    description:
      'Write, generate, and schedule blog posts from your desktop. ' +
      'AI drafting via DeepSeek or Claude, markdown editor with live preview, ' +
      'queue-to-publish flow, weekly auto-publish, ' +
      'and multi-language support (FR/EN) \u2014 all in one native app.',
    tech: 'Rust \u00b7 Dioxus \u00b7 DeepSeek / Claude \u00b7 Markdown',
    status: 'live',
    github: blogtk,
    downloads: [
      {
        os: 'mac',
        label: 'macOS (Apple Silicon)',
        href: `${blogtk}/releases/latest/download/blog-toolkit-macos-arm64.tar.gz`,
        icon: <FaApple className="w-4 h-4" />,
      },
      {
        os: 'linux',
        label: 'Linux x86_64',
        href: `${blogtk}/releases/latest/download/blog-toolkit-linux-x86_64.tar.gz`,
        icon: <FaLinux className="w-4 h-4" />,
      },
      {
        os: 'windows',
        label: 'Windows',
        href: `${blogtk}/releases/latest/download/blog-toolkit-setup.exe`,
        icon: <FaWindows className="w-4 h-4" />,
      },
    ],
  },
  {
    id: 'appscreens',
    name: 'AppScreens',
    tagline: 'The complete iOS & Android build and publish assistant',
    description:
      'Your perfect companion for shipping mobile apps. Build, run, and iterate locally on iOS and Android, ' +
      'then package release artifacts ready for the App Store and Google Play. Handles bundle IDs, ' +
      'signing config, version bumps, screenshot generation in every required size, ' +
      'and the device-frame marketing assets — all from a single native desktop app.',
    tech: 'Rust · Dioxus · Xcode · Gradle · image · imageproc',
    status: 'beta',
    github: screens,
    downloads: [
      {
        os: 'mac',
        label: 'macOS (Apple Silicon)',
        href: `${screens}/releases/latest/download/appscreens-macos-arm64.dmg`,
        icon: <FaApple className="w-4 h-4" />,
      },
      {
        os: 'linux',
        label: 'Linux x86_64 (.deb)',
        href: `${screens}/releases/latest/download/appscreens-linux-x86_64.deb`,
        icon: <FaLinux className="w-4 h-4" />,
      },
      {
        os: 'windows',
        label: 'Windows',
        href: `${screens}/releases/latest/download/appscreens-windows-setup.msi`,
        icon: <FaWindows className="w-4 h-4" />,
      },
    ],
  },
];

const osColors: Record<string, string> = {
  mac:     'bg-neutral-800 hover:bg-neutral-700 text-white',
  linux:   'bg-orange-600  hover:bg-orange-500  text-white',
  windows: 'bg-blue-600    hover:bg-blue-500    text-white',
};

const statusBadge: Record<string, string> = {
  live: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  beta: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  mvp:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  wip:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  coming_soon: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
};

export default function AppsPage() {
  const tPortfolio = useTranslations('portfolio');
  const locale = useLocale();

  const webApps: WebApp[] = [
    {
      name: 'API0.AI',
      description: tPortfolio('api0_description'),
      tech: tPortfolio('api0_tech'),
      url: 'https://api0.ai',
      status: 'live',
      cta: tPortfolio('api0_cta'),
      icon: <Brain className="w-8 h-8" />,
    },
    {
      name: 'CVENOM',
      description: tPortfolio('cvenom_description'),
      tech: tPortfolio('cvenom_tech'),
      url: 'https://cvenom.com',
      status: 'live',
      cta: tPortfolio('cvenom_cta'),
      icon: <Shield className="w-8 h-8" />,
    },
    {
      name: 'SOLANIZE',
      description: tPortfolio('solanize_description'),
      tech: tPortfolio('solanize_tech'),
      url: 'https://ribh.io',
      status: 'mvp',
      cta: tPortfolio('solanize_cta'),
      icon: <Zap className="w-8 h-8" />,
    },
  ];

  const consulting = {
    name: tPortfolio('consulting_title'),
    description: tPortfolio('consulting_description'),
    tech: tPortfolio('consulting_tech'),
    cta: tPortfolio('consulting_cta'),
    icon: <Code className="w-8 h-8" />,
  };

  return (
    <LayoutTemplate>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Apps & Tools
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Web platforms, SaaS tools, and open-source desktop apps — all built with Rust.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Web Apps & SaaS */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl">
          <h2 className="text-2xl font-bold mb-8">Web Apps & SaaS</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {webApps.map((app, i) => (
              <motion.div
                key={app.name}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/20 border border-border p-6 hover:shadow-2xl transition-all duration-300 flex flex-col"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    {app.icon}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[app.status]}`}>
                    {app.status === 'live' ? 'LIVE' : app.status === 'mvp' ? 'MVP' : app.status === 'coming_soon' ? 'COMING SOON' : 'WIP'}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary">{app.name}</h3>
                <p className="text-sm font-medium mb-2">{app.description}</p>
                <p className="text-xs text-muted-foreground mb-4">{app.tech}</p>
                <div className="mt-auto">
                  {app.status === 'coming_soon' ? (
                    <button
                      onClick={() => alert('Coming Soon!')}
                      className="inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-gray-400 text-white cursor-not-allowed opacity-70"
                    >
                      {app.cta}
                    </button>
                  ) : (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-primary text-white hover:bg-primary/90"
                    >
                      {app.cta}
                      <ExternalLink className="ml-1 w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Consulting card */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 hover:shadow-2xl transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-center flex flex-col flex-1">
                <div className="p-3 bg-primary/10 rounded-full text-primary mb-4 inline-block">
                  {consulting.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary">{consulting.name}</h3>
                <p className="text-sm font-medium mb-2">{consulting.description}</p>
                <p className="text-xs text-muted-foreground mb-4">{consulting.tech}</p>
                <div className="mt-auto">
                  <Link
                    href={getLocalizedPath(locale, '/contact')}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
                  >
                    {consulting.cta}
                    <ArrowRight className="ml-1 w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Desktop Apps */}
      <section className="py-16 bg-secondary/30">
        <div className="container max-w-6xl">
          <h2 className="text-2xl font-bold mb-8">Desktop Apps (Open Source)</h2>
          <div className="space-y-10">
            {desktopApps.map((app, i) => (
              <motion.div
                key={app.id}
                id={app.id}
                className="scroll-mt-24 rounded-2xl border border-border bg-background overflow-hidden"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* Top bar */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-secondary/50">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-bold">{app.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${statusBadge[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                  <a
                    href={app.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-secondary transition-colors text-sm font-medium"
                  >
                    <FaGithub className="w-4 h-4" />
                    Open source
                    <FiExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>

                {/* Body */}
                <div className="px-8 py-8 flex flex-col md:flex-row gap-10">
                  <div className="flex-1 space-y-4">
                    <p className="text-lg font-medium text-primary">{app.tagline}</p>
                    <p className="text-muted-foreground leading-relaxed">{app.description}</p>
                    <p className="text-xs text-muted-foreground/70 font-mono">{app.tech}</p>
                  </div>
                  <div className="md:w-64 flex flex-col gap-3">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Download
                    </p>
                    {app.downloads.map((dl) => (
                      <a
                        key={dl.os}
                        href={dl.href}
                        className={`inline-flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium transition-colors ${osColors[dl.os]}`}
                      >
                        {dl.icon}
                        {dl.label}
                      </a>
                    ))}
                    <a
                      href={`${app.github}/releases/latest`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1 text-center"
                    >
                      All releases & checksums
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-secondary">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4">More coming soon</h2>
          <p className="text-muted-foreground mb-6">
            Follow the GitHub org or reach out if you have a tool idea.
          </p>
          <a
            href="https://github.com/Bennekrouf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            <FaGithub className="w-5 h-5" />
            github.com/Bennekrouf
          </a>
        </div>
      </section>

    </LayoutTemplate>
  );
}
