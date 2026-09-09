// File: src/app/stats/page.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';

interface DayDetail {
  total: number;
  installs: number;
  updates: number;
  active: number;
  excluded: number;
  by_app: Record<string, number>;
  by_platform: Record<string, number>;
  by_country: Record<string, number>;
}

interface SiteStats {
  requests: number;
  bot_requests: number;
  unverified_requests: number;
  api_requests: number;
  api_clients_peak_day: number;
  probe_requests: number;
  visitor_days: number;
  by_country: Record<string, number>;
  top_paths: Record<string, number>;
  daily: Record<string, { visitors: number; requests: number; api_requests?: number }>;
}

interface Stats {
  sites?: Record<string, SiteStats>;
  generated_at: string;
  counting_since: string | null;
  days_recorded: number;
  geoip: string;
  totals: { downloads: number; installs: number; updates: number; excluded: number };
  excluded_by_reason: Record<string, number>;
  by_app: Record<string, number>;
  by_platform: Record<string, number>;
  by_country: Record<string, number>;
  active_installs_daily_avg_7d: number;
  daily: Record<string, DayDetail>;
}

// ISO codes are terse; a name is easier to scan. Anything unmapped falls
// through to the code itself rather than being hidden.
const COUNTRY_NAMES: Record<string, string> = {
  CH: 'Switzerland', FR: 'France', DE: 'Germany', US: 'United States',
  GB: 'United Kingdom', IT: 'Italy', ES: 'Spain', NL: 'Netherlands',
  BE: 'Belgium', AT: 'Austria', CA: 'Canada', IN: 'India', BR: 'Brazil',
  PL: 'Poland', SE: 'Sweden', unknown: 'Unknown',
};

function withCountryNames(data: Record<string, number>) {
  return Object.fromEntries(
    Object.entries(data).map(([code, n]) => [
      COUNTRY_NAMES[code] ? `${COUNTRY_NAMES[code]} (${code})` : code,
      n,
    ]),
  );
}

/** A row of bars that also works without a mouse. A hover tooltip is
 *  unreachable on a touch screen, so tapping a bar names it in the caption
 *  below, which otherwise carries the first and last day of the window. */
function Bars<T>({
  days,
  value,
  heightClass,
}: {
  days: [string, T][];
  value: (d: T) => number;
  heightClass: string;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const peak = Math.max(1, ...days.map(([, d]) => value(d)));
  // Past roughly one bar per 3px the gaps consume the whole row and every bar
  // collapses to zero width — a year of history on a phone drew nothing at all.
  const gap = days.length > 60 ? 'gap-px' : days.length > 24 ? 'gap-0.5' : 'gap-1';
  const shown = days.find(([day]) => day === picked);

  return (
    <>
      <div className={`flex items-end ${gap} ${heightClass}`}>
        {days.map(([day, d]) => (
          <button
            key={day}
            type="button"
            onClick={() => setPicked(picked === day ? null : day)}
            aria-label={`${day}: ${value(d)}`}
            className="flex h-full min-w-0 flex-1 flex-col justify-end"
          >
            <div
              className={`w-full rounded-t transition-colors ${
                picked === day ? 'bg-primary' : 'bg-primary/70 hover:bg-primary'
              }`}
              style={{ height: `${Math.max(2, (value(d) / peak) * 100)}%` }}
            />
          </button>
        ))}
      </div>
      <p className="mt-2 flex justify-between gap-2 text-[11px] tabular-nums text-gray-500 dark:text-gray-400">
        {shown ? (
          <span className="text-gray-900 dark:text-white">
            {shown[0]} · {value(shown[1])}
          </span>
        ) : (
          <>
            <span>{days[0][0]}</span>
            <span>{days[days.length - 1][0]}</span>
          </>
        )}
      </p>
    </>
  );
}

/** One hosted product. Downloads do not apply to these — the question is how
 *  many people came at all, so visitors and requests lead. */
function SiteCard({
  name,
  site,
  rangeDays,
}: {
  name: string;
  site: SiteStats;
  rangeDays: number | null;
}) {
  const days = inRange(site.daily ?? {}, rangeDays);
  const paths = Object.entries(site.top_paths ?? {}).slice(0, 5);

  // Totals for the window, so a card never contradicts the range selector.
  const visitorDays = days.reduce((n, [, d]) => n + (d.visitors ?? 0), 0);
  const requests = days.reduce((n, [, d]) => n + (d.requests ?? 0), 0);
  const apiRequests = days.reduce((n, [, d]) => n + (d.api_requests ?? 0), 0);

  return (
    <div className="min-w-0 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h3 className="min-w-0 truncate text-base font-bold text-gray-900 dark:text-white">{name}</h3>
        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400" title="Declared crawlers, plus addresses that requested pages but never loaded a stylesheet or script">
          {(site.bot_requests + (site.unverified_requests ?? 0)).toLocaleString()} bot req filtered
        </span>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-4">
        <div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {visitorDays.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">visitor-days</p>
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
            {requests.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">requests</p>
        </div>
        {apiRequests > 0 && (
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
              {apiRequests.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              API calls · {site.api_clients_peak_day ?? 0} client
              {site.api_clients_peak_day === 1 ? '' : 's'}
            </p>
          </div>
        )}
      </div>

      {days.length > 0 && (
        <div className="mb-4">
          <Bars days={days} value={(d) => d.visitors} heightClass="h-12" />
        </div>
      )}

      {(site.probe_requests ?? 0) > 0 && (
        <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
          {site.probe_requests.toLocaleString()} vulnerability probes blocked
        </p>
      )}

      {paths.length > 0 && (
        <ul className="space-y-1 text-xs">
          {paths.map(([path, n]) => (
            <li key={path} className="flex justify-between gap-3">
              {/* min-w-0, or the un-breakable path sets the card's minimum width
                  and the whole page scrolls sideways on a phone. */}
              <span className="min-w-0 flex-1 truncate font-mono text-gray-600 dark:text-gray-300">{path}</span>
              <span className="shrink-0 text-gray-900 dark:text-white tabular-nums">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


// Ranges are applied in the browser: the server ships a year of per-day
// detail, so switching period is instant and costs no request.
const RANGES: { label: string; days: number | null }[] = [
  { label: 'Today', days: 1 },
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: 'All', days: null },
];

/** Rows the daily table shows before asking. */
const DAILY_ROWS = 30;

function inRange<T>(daily: Record<string, T>, days: number | null): [string, T][] {
  const all = Object.entries(daily ?? {}).sort((a, b) => a[0].localeCompare(b[0]));
  return days === null ? all : all.slice(-days);
}

function sumInto(target: Record<string, number>, source: Record<string, number> | undefined) {
  for (const [key, n] of Object.entries(source ?? {})) target[key] = (target[key] ?? 0) + n;
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
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
    <div className="min-w-0 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Nothing recorded yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {entries.map(([key, n]) => (
            <li key={key}>
              <div className="flex justify-between gap-3 text-sm mb-1">
                <span className="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-300">{key}</span>
                <span className="shrink-0 font-medium text-gray-900 dark:text-white tabular-nums">{n}</span>
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
  const [showAll, setShowAll] = useState(false);
  // Newest first: the question is almost always "what happened recently".
  const rows = Object.entries(daily).sort((a, b) => b[0].localeCompare(a[0]));
  // A year of rows is eight metres of scrolling on a phone before the
  // breakdowns below come into reach, so the tail is behind a button.
  const visible = showAll ? rows : rows.slice(0, DAILY_ROWS);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Daily ({rows.length} day{rows.length === 1 ? '' : 's'})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[340px] text-xs sm:text-sm">
          <thead>
            <tr className="text-left text-[10px] sm:text-xs uppercase tracking-normal sm:tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">
              <th className="px-2.5 sm:px-5 py-2 font-semibold">Day</th>
              <th className="px-1.5 sm:px-3 py-2 font-semibold text-right">Total</th>
              <th className="px-1.5 sm:px-3 py-2 font-semibold text-right">Installs</th>
              <th className="px-1.5 sm:px-3 py-2 font-semibold text-right">Updates</th>
              <th className="px-2.5 sm:px-5 py-2 font-semibold text-right">Active</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(([day, d]) => {
              const expanded = open === day;
              return (
                <React.Fragment key={day}>
                  <tr
                    className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 cursor-pointer"
                    onClick={() => setOpen(expanded ? null : day)}
                    aria-expanded={expanded}
                  >
                    {/* The chevron shares the day cell rather than taking a
                        column of its own — on a 375px screen that column was
                        the one pushed off the edge. */}
                    <td className="px-2.5 sm:px-5 py-3 font-medium whitespace-nowrap text-gray-900 dark:text-white">
                      <span className="flex items-center gap-1">
                        {expanded
                          ? <FiChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                          : <FiChevronRight className="h-4 w-4 shrink-0 text-gray-400" />}
                        {day}
                      </span>
                    </td>
                    <td className="px-1.5 sm:px-3 py-3 text-right tabular-nums text-gray-900 dark:text-white">{d.total}</td>
                    <td className="px-1.5 sm:px-3 py-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{d.installs}</td>
                    <td className="px-1.5 sm:px-3 py-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{d.updates}</td>
                    <td className="px-2.5 sm:px-5 py-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{d.active}</td>
                  </tr>
                  {expanded && (
                    <tr className="bg-gray-50 dark:bg-slate-700/20">
                      <td colSpan={5} className="px-3 sm:px-5 py-3 text-xs text-gray-600 dark:text-gray-300 space-y-1 break-words">
                        <div><span className="font-semibold">Apps:</span> {pairs(d.by_app) || '—'}</div>
                        <div><span className="font-semibold">Platforms:</span> {pairs(d.by_platform) || '—'}</div>
                        <div><span className="font-semibold">Countries:</span> {pairs(withCountryNames(d.by_country ?? {})) || '—'}</div>
                        {d.excluded > 0 && (
                          <div className="text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Filtered out:</span> {d.excluded} bot / self request
                            {d.excluded === 1 ? '' : 's'}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length > visible.length && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="w-full border-t border-gray-200 dark:border-slate-700 px-4 py-3 text-sm font-medium text-primary hover:bg-gray-50 dark:hover:bg-slate-700/30"
        >
          Show all {rows.length} days
        </button>
      )}
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rangeDays, setRangeDays] = useState<number | null>(7);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async (): Promise<string | null> => {
    const response = await fetch('/api/stats');

    // Rate limiting and proxy errors reply in plain text, so parsing before
    // checking the status turns a clear 429 into an opaque JSON syntax error.
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      return (typeof body === 'string' ? body.trim() : body.message || body.error)
        || `Request failed (${response.status})`;
    }
    if (typeof body === 'string') return 'The stats endpoint returned something that is not JSON.';
    setStats(body);
    return null;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const failure = await fetchStats();
      if (failure) setError(failure);
    } catch (err) {
      setError(`Could not reach the stats endpoint. ${err}`);
    }
    setLoading(false);
  }, [fetchStats]);

  useEffect(() => {
    load();
  }, [load]);

  // Everything on the page is recomputed for the chosen window, so the tiles,
  // the chart and the breakdowns can never disagree with each other.
  const view = useMemo(() => {
    if (!stats) return null;
    const days = inRange(stats.daily ?? {}, rangeDays);
    const totals = { downloads: 0, installs: 0, updates: 0, excluded: 0 };
    const byApp: Record<string, number> = {};
    const byPlatform: Record<string, number> = {};
    const byCountry: Record<string, number> = {};
    let activeSum = 0;

    for (const [, d] of days) {
      totals.downloads += d.total ?? 0;
      totals.installs += d.installs ?? 0;
      totals.updates += d.updates ?? 0;
      totals.excluded += d.excluded ?? 0;
      activeSum += d.active ?? 0;
      sumInto(byApp, d.by_app);
      sumInto(byPlatform, d.by_platform);
      sumInto(byCountry, d.by_country);
    }

    return {
      days,
      totals,
      byApp,
      byPlatform,
      byCountry,
      // Averaged, not summed: the same install switched on every day is one
      // install, not seven.
      activeAvg: days.length ? Math.round(activeSum / days.length) : 0,
      from: days.length ? days[0][0] : null,
    };
  }, [stats, rangeDays]);

  // Tolerates an older stats.json: the page and the script that writes the
  // file deploy separately, so the shapes can lag each other.
  const chart = view?.days ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Wraps rather than scrolls sideways: in one scrolling strip the
            Refresh button sat off the right edge of a phone screen. On mobile
            the range picker takes its own full-width row. */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
          <h1 className="mr-auto text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiDownload className="h-6 w-6 text-primary" />
            Downloads
          </h1>
          <button
            onClick={() => load()}
            disabled={loading}
            className="order-1 sm:order-last inline-flex shrink-0 items-center gap-2 px-3 sm:px-4 py-2 min-h-[44px] sm:min-h-0 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="order-2 flex w-full sm:w-auto rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.label}
                onClick={() => setRangeDays(r.days)}
                className={`flex-1 sm:flex-none px-2 sm:px-3 py-2 min-h-[44px] sm:min-h-0 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  rangeDays === r.days
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5 flex gap-3">
            <FiAlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
          </div>
        )}

        {stats && view && (
          <>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Desktop downloads</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Tile
                label="Downloads"
                value={view.totals.downloads.toLocaleString()}
                hint={view.from ? `since ${view.from}` : undefined}
              />
              <Tile label="First installs" value={view.totals.installs.toLocaleString()} hint="from the website" />
              <Tile label="Updates" value={view.totals.updates.toLocaleString()} hint="from in-app banners" />
              <Tile
                label="Active installs"
                value={view.activeAvg.toLocaleString()}
                hint="daily average over the period"
              />
            </div>

            {chart.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Last {chart.length} day{chart.length === 1 ? '' : 's'}
                </h2>
                <Bars days={chart} value={(d) => d.total} heightClass="h-32" />
              </div>
            )}

            <div className="mb-6">
              <DailyTable daily={Object.fromEntries(view.days)} />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Breakdown title="By app" data={view.byApp} />
              <Breakdown title="By platform" data={view.byPlatform} />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Breakdown title="By country" data={withCountryNames(view.byCountry)} />
              <Breakdown title="Filtered out (bots / self)" data={stats.excluded_by_reason ?? {}} />
            </div>

            {stats.sites && Object.keys(stats.sites).length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Products</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Site traffic for everything on this server. A visitor-day is one address on one
                  day, so a weekly regular counts seven times — it tracks engagement, not headcount.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.sites)
                    .sort((a, b) => b[1].visitor_days - a[1].visitor_days)
                    .map(([name, site]) => (
                      <SiteCard key={name} name={name} site={site} rangeDays={rangeDays} />
                    ))}
                </div>
              </div>
            )}

            <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
              Generated {new Date(stats.generated_at).toLocaleString()} · showing {view.days.length} day
              {view.days.length === 1 ? '' : 's'} of {stats.days_recorded ?? 0} recorded ·{' '}
              {view.totals.excluded.toLocaleString()} request
              {view.totals.excluded === 1 ? '' : 's'} filtered out in this period · country data:{' '}
              {stats.geoip ?? 'disabled'}. Top-path breakdowns are all-time.
              Counts are unique IP per file per day, excluding bots, HEAD requests and checksum fetches —
              so they undercount shared networks and overcount anyone on a changing IP.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
