#!/usr/bin/env node
// Lighthouse against the pages that matter, in light and dark mode, failing
// when any of them drops below the budget. Run it after a deploy:
//
//   yarn perf-budget                        https://mayorana.ch
//   yarn perf-budget http://localhost:3017  a local production build
//
// Needs Chrome installed; fetches Lighthouse through npx. Takes a few minutes:
// one run per page per theme, a pause between them so the site's per-IP rate
// limit (src/middleware.ts) is not what gets measured.
//
// The numbers are the Phase A/B baseline (docs/baseline-2026-10.md) with some
// headroom for the network: a regression trips it, a slow run should not.

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BASE = (process.argv[2] || 'https://mayorana.ch').replace(/\/$/, '');
const LIGHTHOUSE = 'lighthouse@13.6.0';
const PAUSE_MS = 8000;

const PAGES = [
  '/en',
  '/fr',
  '/en/apps',
  '/en/apps/gitagent',
  '/en/blog',
  '/en/blog/why-rust-memory-safe',
  '/en/learn/rust',
  '/en/pricing',
  '/en/contact',
];

// Scores are 0–100; times in ms; bytes compressed.
const BUDGET = {
  performance: 90,
  accessibility: 100,
  seo: 100,
  'best-practices': 95,
  lcp: 2500,
  cls: 0.1,
  tbt: 200,
  scriptBytes: 300 * 1024,
};

const THEMES = { light: 1, dark: 0 }; // Blink's preferredColorScheme values

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Lighthouse now and then dies on a run (a lost DevTools node, a page closed
// under it) with nothing wrong with the page; one retry tells that apart from
// a page that really fails to load.
function auditWithRetry(url, theme) {
  try {
    return audit(url, theme);
  } catch {
    return audit(url, theme);
  }
}

function audit(url, theme) {
  const out = path.join(os.tmpdir(), `perf-budget-${process.pid}.json`);
  execFileSync(
    'npx',
    [
      '-y', LIGHTHOUSE, url, '--quiet',
      '--only-categories=performance,accessibility,seo,best-practices',
      `--chrome-flags=--headless=new --blink-settings=preferredColorScheme=${THEMES[theme]}`,
      '--output=json', `--output-path=${out}`,
    ],
    { stdio: 'ignore' },
  );
  const report = JSON.parse(fs.readFileSync(out, 'utf8'));
  fs.unlinkSync(out);
  const { categories: c, audits: a } = report;
  const score = (id) => Math.round((c[id]?.score ?? 0) * 100);
  return {
    performance: score('performance'),
    accessibility: score('accessibility'),
    seo: score('seo'),
    'best-practices': score('best-practices'),
    lcp: a['largest-contentful-paint'].numericValue,
    cls: a['cumulative-layout-shift'].numericValue,
    tbt: a['total-blocking-time'].numericValue,
    scriptBytes: a['network-requests'].details.items
      .filter((item) => item.resourceType === 'Script')
      .reduce((sum, item) => sum + (item.transferSize || 0), 0),
    failedAudits: ['accessibility', 'seo']
      .flatMap((cat) => c[cat].auditRefs)
      .filter((ref) => a[ref.id]?.score === 0)
      .map((ref) => ref.id),
  };
}

function overBudget(result) {
  const problems = [];
  for (const key of ['performance', 'accessibility', 'seo', 'best-practices']) {
    if (result[key] < BUDGET[key]) problems.push(`${key} ${result[key]} < ${BUDGET[key]}`);
  }
  if (result.lcp > BUDGET.lcp) problems.push(`LCP ${(result.lcp / 1000).toFixed(1)}s > ${BUDGET.lcp / 1000}s`);
  if (result.cls > BUDGET.cls) problems.push(`CLS ${result.cls.toFixed(3)} > ${BUDGET.cls}`);
  if (result.tbt > BUDGET.tbt) problems.push(`TBT ${Math.round(result.tbt)}ms > ${BUDGET.tbt}ms`);
  if (result.scriptBytes > BUDGET.scriptBytes) {
    problems.push(`JS ${Math.round(result.scriptBytes / 1024)}KB > ${BUDGET.scriptBytes / 1024}KB`);
  }
  if (result.failedAudits.length) problems.push(`failing: ${result.failedAudits.join(', ')}`);
  return problems;
}

async function main() {
  console.log(`Performance budget for ${BASE}\n`);
  let failures = 0;
  for (const page of PAGES) {
    for (const theme of Object.keys(THEMES)) {
      let line = `${page} (${theme})`.padEnd(42);
      try {
        const result = auditWithRetry(`${BASE}${page}`, theme);
        const problems = overBudget(result);
        line +=
          `perf ${result.performance} a11y ${result.accessibility} seo ${result.seo} ` +
          `LCP ${(result.lcp / 1000).toFixed(1)}s CLS ${result.cls.toFixed(3)} JS ${Math.round(result.scriptBytes / 1024)}KB`;
        if (problems.length) {
          failures++;
          line = `❌ ${line}\n     ${problems.join('; ')}`;
        } else {
          line = `✅ ${line}`;
        }
      } catch (error) {
        failures++;
        line = `⚠️  ${line} Lighthouse failed: ${error.message.split('\n')[0]}`;
      }
      console.log(line);
      await sleep(PAUSE_MS);
    }
  }
  console.log(failures ? `\n${failures} run(s) over budget.` : '\nAll within budget.');
  process.exit(failures ? 1 : 0);
}

main();
