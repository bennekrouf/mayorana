// File: src/app/stats/page.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiLock,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';

interface DayDetail {
  total: number;
  installs: number;
  updates: number;
  active: number;
  by_app: Record<string, number>;
  by_platform: Record<string, number>;
}

interface Stats {
  generated_at: string;
  counting_since: string | null;
  days_recorded: number;
  totals: { downloads: number; installs: number; updates: number };
  by_app: Record<string, number>;
  by_platform: Record<string, number>;
  by_app_version: Record<string, number>;
  active_installs_daily_avg_7d: number;
  daily: Record<string, DayDetail>;
}

const KEY_STORAGE = 'stats-key';

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

/** Bars scale to the largest value rather than the total, so one dominant
 *  entry does not flatten the rest into invisibility. */
function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
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
                <div className="h-full rounded-full bg-primary" style={{ width: `${(n / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function pairs(data: Record<string, number>) {
  return Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${k} ${n}`)
    .join(' · ');
}

/** One row per day, expandable to the per-app and per-platform split for
 *  that day — the daily view the totals cannot answer on their own. */
function DailyTable({ daily }: { daily: Record<string, DayDetail> }) {
  const [open, setOpen] = useState<string | null>(null);
  // Newest first: the question is almost always "what happened recently".
  const rows = Object.entries(daily).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Daily ({rows.length} day{rows.length === 1 ? '' : 's'})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">
              <th className="px-5 py-2 font-semibold">Day</th>
              <th className="px-3 py-2 font-semibold text-right">Total</th>
              <th className="px-3 py-2 font-semibold text-right">Installs</th>
              <th className="px-3 py-2 font-semibold text-right">Updates</th>
              <th className="px-3 py-2 py-2 font-semibold text-right">Active</th>
              <th className="px-5 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map(([day, d]) => {
              const expanded = open === day;
              return (
                <React.Fragment key={day}>
                  <tr
                    className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 cursor-pointer"
                    onClick={() => setOpen(expanded ? null : day)}
                  >
                    <td className="px-5 py-2.5 font-medium text-gray-900 dark:text-white">{day}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-gray-900 dark:text-white">{d.total}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">{d.installs}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">{d.updates}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">{d.active}</td>
                    <td className="px-5 py-2.5 text-gray-400">
                      {expanded ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="bg-gray-50 dark:bg-slate-700/20">
                      <td colSpan={6} className="px-5 py-3 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        <div><span className="font-semibold">Apps:</span> {pairs(d.by_app) || '—'}</div>
                        <div><span className="font-semibold">Platforms:</span> {pairs(d.by_platform) || '—'}</div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async (secret: string): Promise<string | null> => {
    const response = await fetch('/api/stats', {
      headers: { Authorization: `Bearer ${secret}` },
    });

    // Rate limiting and proxy errors reply in plain text, so parsing before
    // checking the status turns a clear 429 into an opaque JSON syntax error.
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401) return 'Wrong key.';
      return (typeof body === 'string' ? body.trim() : body.message || body.error)
        || `Request failed (${response.status})`;
    }
    if (typeof body === 'string') return 'The stats endpoint returned something that is not JSON.';
    setStats(body);
    return null;
  }, []);

  const load = useCallback(
    async (secret: string, remember: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const failure = await fetchStats(secret);
        if (failure) {
          setError(failure);
          if (remember) sessionStorage.removeItem(KEY_STORAGE);
        } else {
          setAuthed(true);
          if (remember) sessionStorage.setItem(KEY_STORAGE, secret);
        }
      } catch (err) {
        setError(`Could not reach the stats endpoint. ${err}`);
      }
      setLoading(false);
    },
    [fetchStats],
  );

  // Kept for the session only, so a shared or borrowed machine does not stay
  // signed in after the browser closes.
  useEffect(() => {
    const saved = sessionStorage.getItem(KEY_STORAGE);
    if (saved) load(saved, true);
  }, [load]);

  const chart = useMemo(() => {
    if (!stats) return [];
    // Tolerates an older stats.json: the page and the script that writes
    // the file deploy separately, so the shapes can lag each other.
    return Object.entries(stats.daily ?? {}).sort((a, b) => a[0].localeCompare(b[0])).slice(-30);
  }, [stats]);
  const peak = Math.max(1, ...chart.map(([, d]) => d.total));

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(key, true);
          }}
          className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8"
        >
          <div className="text-center mb-6">
            <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLock className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Download statistics</h1>
          </div>

          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Access key"
            autoComplete="off"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />

          {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !key.trim()}
            className="mt-5 w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'View'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiDownload className="h-6 w-6 text-primary" />
            Downloads
          </h1>
          <button
            onClick={() => load(sessionStorage.getItem(KEY_STORAGE) || '', false)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5 flex gap-3">
            <FiAlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
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
              <Tile label="First installs" value={stats.totals.installs.toLocaleString()} hint="from the website" />
              <Tile label="Updates" value={stats.totals.updates.toLocaleString()} hint="from in-app banners" />
              <Tile
                label="Active installs"
                value={stats.active_installs_daily_avg_7d.toLocaleString()}
                hint="daily average, last 7 days"
              />
            </div>

            {chart.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Last {chart.length} day{chart.length === 1 ? '' : 's'}
                </h2>
                <div className="flex items-end gap-1 h-32">
                  {chart.map(([day, d]) => (
                    <div key={day} className="flex-1 group relative flex flex-col justify-end h-full">
                      <div
                        className="w-full rounded-t bg-primary/80 group-hover:bg-primary transition-colors"
                        style={{ height: `${Math.max(2, (d.total / peak) * 100)}%` }}
                      />
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[11px] text-white z-10">
                        {day}: {d.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <DailyTable daily={stats.daily ?? {}} />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Breakdown title="By app" data={stats.by_app} />
              <Breakdown title="By platform" data={stats.by_platform} />
            </div>

            {/* Which versions are still being pulled — the number that says how
                many people run a build with a bug that is already fixed. */}
            <Breakdown title="By version" data={stats.by_app_version} />

            <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
              Generated {new Date(stats.generated_at).toLocaleString()} · {stats.days_recorded ?? 0} day
              {stats.days_recorded === 1 ? '' : 's'} recorded. Counts are unique IP per file per day,
              excluding bots, HEAD requests and checksum fetches — so they undercount shared networks
              and overcount anyone on a changing IP.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
