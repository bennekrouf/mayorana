'use client';

// A Run button under each complete Rust example in a post: one with a
// `fn main`, so it builds as a program. The code goes to the official Rust
// Playground (play.rust-lang.org, which allows cross-origin calls) only when
// the reader clicks, and the output appears under the block. A fence written
// ```rust,ignore gets no button.
//
// The post body is HTML generated at build time, rendered with
// dangerouslySetInnerHTML, so a mount point is added after each runnable <pre>
// and the panel is portalled into it. On a full page load the body's nodes can
// be replaced after this component first mounts (hydration settling), which
// would leave the panels in detached nodes; a MutationObserver re-adds any
// mount point that has gone missing.

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Loader2, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

const PLAYGROUND = 'https://play.rust-lang.org';
const EDITION = '2021';
const TIMEOUT_MS = 20_000;

/** Runnable: Rust, not marked ignore, and a whole program. */
export function isRunnable(className: string, code: string): boolean {
  const [lang, ...flags] = className.replace(/^language-/, '').split(',');
  return lang === 'rust' && !flags.includes('ignore') && /\bfn\s+main\s*\(/.test(code);
}

type Run =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'done'; success: boolean; stdout: string; stderr: string }
  | { kind: 'error' };

// Cargo's progress lines say nothing about the program; keep the compiler's
// warnings and errors and the program's own stderr.
function cleanStderr(stderr: string): string {
  return stderr
    .split('\n')
    .filter((line) => !/^\s*(Compiling|Finished|Running) /.test(line))
    .join('\n')
    .trim();
}

function RunPanel({ code }: { code: string }) {
  const t = useTranslations('blog');
  const [run, setRun] = useState<Run>({ kind: 'idle' });

  const execute = async () => {
    setRun({ kind: 'running' });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(`${PLAYGROUND}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'stable',
          mode: 'debug',
          edition: EDITION,
          crateType: 'bin',
          tests: false,
          backtrace: false,
          code,
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      setRun({
        kind: 'done',
        success: Boolean(body.success),
        stdout: String(body.stdout ?? ''),
        stderr: cleanStderr(String(body.stderr ?? '')),
      });
    } catch {
      setRun({ kind: 'error' });
    } finally {
      clearTimeout(timer);
    }
  };

  const playgroundUrl = `${PLAYGROUND}/?version=stable&mode=debug&edition=${EDITION}&code=${encodeURIComponent(code)}`;

  return (
    <div className="not-prose -mt-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={execute}
          disabled={run.kind === 'running'}
          aria-label={t('run_label')}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70 transition-colors"
        >
          {run.kind === 'running' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {run.kind === 'running' ? t('run_running') : t('run_code')}
        </button>
        <a
          href={playgroundUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('run_open')}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <div aria-live="polite">
        {run.kind === 'error' && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{t('run_failed')}</p>}
        {run.kind === 'done' && (
          <div className="mt-3 rounded-lg border border-border bg-secondary/60 p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('run_output')}</p>
            <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
              {run.stdout && <span>{run.stdout}</span>}
              {run.stderr && (
                <span className={run.success ? 'text-muted-foreground' : 'text-red-700 dark:text-red-400'}>
                  {run.stdout ? '\n' : ''}
                  {run.stderr}
                </span>
              )}
              {!run.stdout && !run.stderr && <span className="text-muted-foreground">{t('run_no_output')}</span>}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

const MOUNT_ATTR = 'data-run-snippet';

export function RunnableSnippets({ container }: { container: React.RefObject<HTMLElement | null> }) {
  const [targets, setTargets] = useState<{ node: HTMLElement; code: string }[]>([]);

  useEffect(() => {
    const root = container.current;
    if (!root) return;

    // Ensures every runnable block is followed by its mount point, and
    // publishes the list only when a mount point had to be (re)created.
    const scan = () => {
      let changed = false;
      const found: { node: HTMLElement; code: string }[] = [];
      root.querySelectorAll<HTMLElement>('pre > code[class^="language-rust"]').forEach((codeEl) => {
        const code = codeEl.textContent ?? '';
        if (!isRunnable(codeEl.className, code)) return;
        const pre = codeEl.parentElement!;
        let mount = pre.nextElementSibling as HTMLElement | null;
        if (!mount?.hasAttribute(MOUNT_ATTR)) {
          mount = document.createElement('div');
          mount.setAttribute(MOUNT_ATTR, '');
          pre.after(mount);
          changed = true;
        }
        found.push({ node: mount, code });
      });
      if (changed) setTargets(found);
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(root, { childList: true });
    return () => {
      observer.disconnect();
      root.querySelectorAll(`[${MOUNT_ATTR}]`).forEach((node) => node.remove());
    };
  }, [container]);

  return <>{targets.map(({ node, code }, i) => createPortal(<RunPanel code={code} />, node, String(i)))}</>;
}
