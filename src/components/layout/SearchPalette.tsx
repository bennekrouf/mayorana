'use client';

// ⌘K (Ctrl+K, or "/") search over the whole site: articles, apps, learning
// paths and pages, from the per-locale index in src/lib/search-index.ts. The
// index is fetched the first time the palette opens, so a visitor who never
// searches never downloads it.
//
// When Ask Mayorana is on (src/lib/ask.ts; the index says so), the first row
// for anything typed is "Ask Mayorana: <question>": choosing it sends the
// question to /api/ask and shows the answer, with its sources, in place of
// the results.
//
// Keyboard first: arrows move, Enter opens, Escape closes (or goes back from
// an answer). The input is a combobox driving a listbox, so a screen reader
// announces the highlighted row as the arrows move.

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiMessageCircle, FiSearch } from 'react-icons/fi';
import { useLocale, useTranslations } from 'next-intl';
import { loadSearchIndex, search, type SearchIndex, type SearchItem } from '@/lib/search-client';

type Load = { kind: 'idle' } | { kind: 'loading' } | { kind: 'ready'; index: SearchIndex } | { kind: 'error' };

type Answer =
  | { kind: 'none' }
  | { kind: 'loading'; question: string }
  | { kind: 'ready'; question: string; html: string; sources: { n: number; title: string; url: string }[] }
  | { kind: 'error'; question: string; code: string };

const ASK_ERRORS = ['empty', 'limit_ip', 'limit_day', 'exhausted', 'failed'];

/** Shown before anything is typed: the learning paths, then the key pages. */
function suggestions(index: SearchIndex): SearchItem[] {
  return [
    ...index.items.filter((item) => item.type === 'track'),
    ...index.items.filter((item) => item.type === 'page').slice(0, 4),
  ];
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
}

/** One row of the listbox: the Ask row, or a search result. */
type Row = { kind: 'ask' } | { kind: 'item'; item: SearchItem };

export function SearchPalette() {
  const t = useTranslations('search');
  const tNav = useTranslations('navigation');
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [load, setLoad] = useState<Load>({ kind: 'idle' });
  const [answer, setAnswer] = useState<Answer>({ kind: 'none' });
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const requested = useRef(false);

  const show = useCallback(() => {
    setOpen(true);
    if (requested.current) return;
    requested.current = true;
    setLoad({ kind: 'loading' });
    loadSearchIndex(locale)
      .then((index) => setLoad({ kind: 'ready', index }))
      .catch(() => {
        // Let the next open try again.
        requested.current = false;
        setLoad({ kind: 'error' });
      });
  }, [locale]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
    setAnswer({ kind: 'none' });
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) close();
        else show();
      } else if (e.key === '/' && !open && !isTyping(e.target)) {
        e.preventDefault();
        show();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, show, close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const askable = load.kind === 'ready' && load.index.ask && query.trim().length >= 3;

  const rows = useMemo<Row[]>(() => {
    if (load.kind !== 'ready') return [];
    const items = query.trim() ? search(load.index, query) : suggestions(load.index);
    return [...(askable ? [{ kind: 'ask' as const }] : []), ...items.map((item) => ({ kind: 'item' as const, item }))];
  }, [load, query, askable]);

  const askQuestion = async (question: string) => {
    setAnswer({ kind: 'loading', question });
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, locale }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.html) {
        setAnswer({ kind: 'error', question, code: ASK_ERRORS.includes(body.error) ? body.error : 'failed' });
        return;
      }
      setAnswer({ kind: 'ready', question, html: body.html, sources: body.sources ?? [] });
    } catch {
      setAnswer({ kind: 'error', question, code: 'failed' });
    }
  };

  const choose = (row: Row | undefined) => {
    if (!row) return;
    if (row.kind === 'ask') {
      void askQuestion(query.trim());
      return;
    }
    close();
    router.push(row.item.url);
  };

  const backToResults = () => {
    setAnswer({ kind: 'none' });
    inputRef.current?.focus();
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (answer.kind !== 'none') backToResults();
      else close();
      return;
    }
    if (answer.kind !== 'none') return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, rows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(rows[active]);
    }
  };

  const showingAnswer = answer.kind !== 'none';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={show}
        aria-label={tNav('search')}
        aria-keyshortcuts="Meta+K Control+K"
        className="flex items-center gap-2 rounded-lg p-2 md:px-3 md:py-1.5 text-muted-foreground hover:text-foreground md:border md:border-border hover:bg-secondary transition-colors"
      >
        <FiSearch className="h-4 w-4" aria-hidden="true" />
        <kbd className="hidden lg:inline text-xs font-sans text-muted-foreground">⌘K</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-[12vh]"
          onClick={close}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={tNav('search')}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <FiSearch className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                  if (showingAnswer) setAnswer({ kind: 'none' });
                }}
                onKeyDown={onInputKey}
                placeholder={t(load.kind === 'ready' && load.index.ask ? 'placeholder_ask' : 'placeholder')}
                role="combobox"
                aria-expanded={!showingAnswer && rows.length > 0}
                aria-controls={listId}
                aria-activedescendant={!showingAnswer && rows[active] ? `${listId}-${active}` : undefined}
                aria-autocomplete="list"
                className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {showingAnswer ? (
                <div className="p-2" aria-live="polite">
                  <button
                    type="button"
                    onClick={backToResults}
                    className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('ask_back')}
                  </button>
                  <p className="mb-3 text-sm font-medium">{answer.question}</p>
                  {answer.kind === 'loading' && <p className="text-sm text-muted-foreground">{t('ask_thinking')}</p>}
                  {answer.kind === 'error' && (
                    <p className="text-sm text-muted-foreground">{t(`ask_error_${answer.code}`)}</p>
                  )}
                  {answer.kind === 'ready' && (
                    <>
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        // Rendered and sanitised on the server: raw HTML escaped, http(s) links only.
                        dangerouslySetInnerHTML={{ __html: answer.html }}
                      />
                      {answer.sources.length > 0 && (
                        <div className="mt-4 border-t border-border pt-3">
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {t('ask_sources')}
                          </p>
                          <ol className="space-y-1 text-sm">
                            {answer.sources.map((source) => (
                              <li key={source.url}>
                                <a
                                  href={source.url}
                                  onClick={(e) => {
                                    // Same-site sources open in the page, like any result.
                                    const path = source.url.replace(/^https:\/\/mayorana\.ch/, '');
                                    if (path.startsWith('/')) {
                                      e.preventDefault();
                                      close();
                                      router.push(path);
                                    }
                                  }}
                                  className="text-primary underline underline-offset-2"
                                >
                                  [{source.n}] {source.title}
                                </a>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                      <p className="mt-4 text-xs text-muted-foreground">{t('ask_note')}</p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {load.kind === 'loading' && <p className="px-3 py-6 text-sm text-muted-foreground">{t('loading')}</p>}
                  {load.kind === 'error' && <p className="px-3 py-6 text-sm text-muted-foreground">{t('error')}</p>}
                  {load.kind === 'ready' && rows.length === 0 && (
                    <p className="px-3 py-6 text-sm text-muted-foreground">{t('no_results', { query: query.trim() })}</p>
                  )}
                  {load.kind === 'ready' && !query.trim() && rows.length > 0 && (
                    <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('suggestions')}
                    </p>
                  )}
                  <ul id={listId} role="listbox" aria-label={tNav('search')}>
                    {rows.map((row, i) => (
                      <li
                        key={row.kind === 'ask' ? 'ask' : row.item.url}
                        id={`${listId}-${i}`}
                        role="option"
                        aria-selected={i === active}
                        onMouseMove={() => setActive(i)}
                        onClick={() => choose(row)}
                        className={`cursor-pointer rounded-lg px-3 py-2.5 ${i === active ? 'bg-secondary' : ''}`}
                      >
                        {row.kind === 'ask' ? (
                          <span className="flex items-center gap-2">
                            <FiMessageCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                            <span className="font-medium leading-snug line-clamp-1">
                              {t('ask_row', { query: query.trim() })}
                            </span>
                          </span>
                        ) : (
                          <>
                            <span className="flex items-baseline justify-between gap-3">
                              <span className="font-medium leading-snug line-clamp-1">{row.item.title}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">{t(`types.${row.item.type}`)}</span>
                            </span>
                            <span className="mt-0.5 block text-sm text-muted-foreground line-clamp-1">{row.item.text}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <p className="hidden sm:block border-t border-border px-4 py-2 text-xs text-muted-foreground">{t('hint')}</p>
          </div>
        </div>
      )}
    </>
  );
}
