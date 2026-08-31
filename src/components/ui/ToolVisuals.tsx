'use client';

import React from 'react';
import { FaGithub, FaApple, FaLinux, FaWindows } from 'react-icons/fa';
import { Database, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
 * page so download URLs stay identical on both. `github` is optional: pass it
 * to add the source/releases links, omit it for products whose repo is private.
 */
export function DownloadButtons({
  downloads,
  github,
}: {
  downloads: DownloadLink[];
  github?: string;
}) {
  const tApps = useTranslations('apps');

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
            title={dl.label}
            aria-label={dl.label}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${osColors[dl.os]}`}
          >
            {osIcons[dl.os]}
          </a>
        ))}
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            aria-label="GitHub"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
          >
            <FaGithub className="w-4 h-4" />
          </a>
        )}
      </div>
      {github && (
        <a
          href={`${github}/releases/latest`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {tApps('all_releases')}
        </a>
      )}
    </div>
  );
}
