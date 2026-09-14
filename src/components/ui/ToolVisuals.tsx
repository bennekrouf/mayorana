'use client';

import React from 'react';
import { FaApple, FaLinux, FaWindows } from 'react-icons/fa';
import { Database, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDownloadGate } from '@/providers/DownloadGateProvider';
import {
  osColors,
  statusBadge,
  statusLabel,
  type DataSource,
  type DataSourceId,
  type DownloadLink,
  type OS,
  type Status,
} from '@/data/tools';

// Icons live here rather than in src/data/tools.ts so that stays a plain data
// module; `os` and `dataSource.id` are the tags that get mapped.
const osIcons: Record<OS, React.ReactNode> = {
  mac: <FaApple className="w-4 h-4" />,
  linux: <FaLinux className="w-4 h-4" />,
  windows: <FaWindows className="w-4 h-4" />,
};

const dataSourceIcons: Record<DataSourceId, React.ReactNode> = {
  cosmos: <Database className="w-3.5 h-3.5" />,
  'log-analytics': <BarChart3 className="w-3.5 h-3.5" />,
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium uppercase whitespace-nowrap ${statusBadge[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function DataSourceBadge({ dataSource }: { dataSource: DataSource }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${dataSource.colorClasses}`}
    >
      {dataSourceIcons[dataSource.id]}
      {dataSource.label}
    </span>
  );
}

/**
 * The per-OS download row, shared by the Apps catalogue and the Azure Solutions
 * page so download URLs stay identical on both. Builds are served from
 * mayorana.ch only — the repositories are private, so there is no source or
 * releases link to offer alongside them.
 */
//
// Both variants keep a real href (right-click → copy link still works) but
// route a click through the download gate, which asks for a sign-in first —
// see DownloadGateProvider. `app`/`appName` identify the tool for that.
export interface DownloadButtonsProps {
  app: string;
  appName: string;
  downloads: DownloadLink[];
}

function useGatedClick(app: string, appName: string) {
  const { requestDownload } = useDownloadGate();
  return (dl: DownloadLink) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Modifier clicks (open in new tab, etc.) keep the browser's behaviour.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    requestDownload({ app, appName, os: dl.os, href: dl.href });
  };
}

export function DownloadButtons({ app, appName, downloads }: DownloadButtonsProps) {
  const tApps = useTranslations('apps');
  const gated = useGatedClick(app, appName);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
        {tApps('download_label')}
      </p>
      <div className="flex flex-wrap gap-2">
        {downloads.map((dl) => (
          <a
            key={dl.os}
            href={dl.href}
            onClick={gated(dl)}
            title={dl.label}
            aria-label={dl.label}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${osColors[dl.os]}`}
          >
            {osIcons[dl.os]}
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * The download row for a single tool's own page. Same URLs as DownloadButtons,
 * but labelled and full-size: on a detail page the download is the point of the
 * page, not one control on a card competing with ten siblings.
 */
export function DownloadButtonsLarge({ app, appName, downloads }: DownloadButtonsProps) {
  const gated = useGatedClick(app, appName);

  return (
    <div className="flex flex-wrap gap-3">
      {downloads.map((dl) => (
        <a
          key={dl.os}
          href={dl.href}
          onClick={gated(dl)}
          className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-lg font-medium text-sm transition-colors ${osColors[dl.os]}`}
        >
          {osIcons[dl.os]}
          {dl.label}
        </a>
      ))}
    </div>
  );
}
