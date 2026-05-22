'use client';

import React from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';
import { FaGithub, FaApple, FaLinux, FaWindows } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';

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

const apps: DesktopApp[] = [
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
];

const osColors: Record<string, string> = {
  mac:     'bg-neutral-800 hover:bg-neutral-700 text-white',
  linux:   'bg-orange-600  hover:bg-orange-500  text-white',
  windows: 'bg-blue-600    hover:bg-blue-500    text-white',
};

const statusBadge: Record<string, string> = {
  live: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  beta: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  wip:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
};

export default function AppsPage() {
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
              Desktop Apps
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Open-source tools built with Rust — download for macOS, Linux or Windows.
            </motion.p>
          </div>
        </div>
      </section>

      {/* App cards */}
      <section className="py-16 bg-background">
        <div className="container max-w-5xl">
          <div className="space-y-10">
            {apps.map((app, i) => (
              <motion.div
                key={app.id}
                id={app.id}
                className="scroll-mt-24 rounded-2xl border border-border bg-secondary/30 overflow-hidden"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* Top bar */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-secondary/50">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">{app.name}</h2>
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

                  {/* Left: description */}
                  <div className="flex-1 space-y-4">
                    <p className="text-lg font-medium text-primary">{app.tagline}</p>
                    <p className="text-muted-foreground leading-relaxed">{app.description}</p>
                    <p className="text-xs text-muted-foreground/70 font-mono">{app.tech}</p>
                  </div>

                  {/* Right: downloads */}
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
                      All releases & checksums ↗
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
