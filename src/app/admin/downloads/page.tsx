// File: src/app/admin/downloads/page.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FiDownload, FiRefreshCw, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

interface Stats {
  generated_at: string;
  counting_since: string | null;
  totals: { downloads: number; installs: number; updates: number };
  by_app: Record<string, number>;
  by_platform: Record<string, number>;
  by_app_version: Record<string, number>;
  active_installs_daily_avg_7d: number;
  last_30_days: Record<string, number>;
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

/** Horizontal bars, scaled to the largest value rather than to the total, so
 *  a dominant entry does not flatten everything else into invisibility. */
function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, n]) => n));

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Nothing recorded yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {entries.map(([key, n]) => (
            <li key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300 truncate pr-3">{key}</span>
                <span className="font-medium text-gray-900 dark:text-white tabular-nums">{n}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(n / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DownloadsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Set by the login form on /admin; this page deliberately has no login of
    // its own rather than duplicating that flow.
    const key = sessionStorage.getItem('admin-key');
    if (!key) {
      setError('Sign in at /admin first — this page reuses that session.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/downloads', {
        headers: { Authorization: `Bearer ${key}` },
      });

      // Rate limiting and proxy errors reply in plain text, so parsing first
      // and checking the status afterwards turns a clear "429" into an opaque
      // JSON syntax error.
      const isJson = response.headers
        .get('content-type')
        ?.includes('application/json');
      const body = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const detail = typeof body === 'string' ? body.trim() : body.message || body.error;
        setError(detail || `Request failed (${response.status})`);
      } else if (typeof body === 'string') {
        setError('The stats endpoint returned something that is not JSON.');
      } else {
        setStats(body);
      }
    } catch (err) {
      setError(`Could not reach the stats endpoint. ${err}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const days = stats ? Object.entries(stats.last_30_days) : [];
  const peak = Math.max(1, ...days.map(([, n]) => n));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-2"
            >
              <FiArrowLeft className="h-3.5 w-3.5" />
              Admin
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiDownload className="h-6 w-6 text-primary" />
              Downloads
            </h1>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5 flex gap-3">
            <FiAlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
            </div>
          </div>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Tile
                label="Downloads"
                value={stats.totals.downloads.toLocaleString()}
                hint={stats.counting_since ? `since ${stats.counting_since}` : undefined}
              />
              <Tile
                label="First installs"
                value={stats.totals.installs.toLocaleString()}
                hint="from the website"
              />
              <Tile
                label="Updates"
                value={stats.totals.updates.toLocaleString()}
                hint="from in-app banners"
              />
              <Tile
                label="Active installs"
                value={stats.active_installs_daily_avg_7d.toLocaleString()}
                hint="daily average, last 7 days"
              />
            </div>

            {days.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Last {days.length} day{days.length === 1 ? '' : 's'}
                </h2>
                <div className="flex items-end gap-1 h-32">
                  {days.map(([day, n]) => (
                    <div key={day} className="flex-1 group relative flex flex-col justify-end h-full">
                      <div
                        className="w-full rounded-t bg-primary/80 group-hover:bg-primary transition-colors"
                        style={{ height: `${Math.max(2, (n / peak) * 100)}%` }}
                      />
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[11px] text-white">
                        {day}: {n}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Breakdown title="By app" data={stats.by_app} />
              <Breakdown title="By platform" data={stats.by_platform} />
            </div>

            <div className="mt-4">
              {/* Which versions are still being pulled — the number that says
                  how many people are running a build with a fixed bug. */}
              <Breakdown title="By version" data={stats.by_app_version} />
            </div>

            <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
              Generated {new Date(stats.generated_at).toLocaleString()}. Counts are unique
              IP per file per day, excluding bots, HEAD requests and checksum fetches —
              so they undercount shared networks and overcount anyone on a changing IP.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
