'use client';

// The frame around a tool's detail when it opens over the catalogue: a panel
// sliding in from the right over a dimmed backdrop. The URL is already the
// tool's own (/apps/[slug], intercepted), so closing is a step back in history
// — taken only once the exit animation has played, or the panel would vanish
// mid-slide as the route unmounts it.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';

// Whether a panel is on screen right now. A related tool opened from inside
// the panel mounts a new panel before the old one unmounts; that one should
// swap its content in place rather than slide in again from off-screen.
let panelOnScreen = false;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function AppDetailPanel({
  title,
  fullPageHref,
  labels,
  children,
}: {
  title: string;
  fullPageHref: string;
  labels: { close: string; openPage: string };
  children: React.ReactNode;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(true);
  const [swapping] = useState(() => panelOnScreen);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    panelOnScreen = true;
    return () => {
      panelOnScreen = false;
    };
  }, []);

  // Escape closes; the page behind stays put while the panel scrolls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);

    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [close]);

  // A new tool in the same panel starts at its top.
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [title]);

  const duration = reduceMotion ? 0 : 0.45;

  return (
    <AnimatePresence onExitComplete={() => router.back()}>
      {open && (
        <div className="fixed inset-0 z-[60]" role="presentation">
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={swapping ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeOut' }}
            onClick={close}
            aria-hidden="true"
          />

          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="absolute inset-y-0 right-0 flex w-full sm:w-[min(760px,92vw)] flex-col bg-background shadow-2xl sm:border-l sm:border-border"
            initial={swapping ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration, ease: EASE_OUT }}
          >
            <header className="flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
              <motion.span
                key={title}
                className="truncate text-sm font-semibold text-muted-foreground"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3, delay: swapping ? 0 : 0.15 }}
              >
                {title}
              </motion.span>
              <div className="flex shrink-0 items-center gap-1">
                {/* A plain anchor: a client-side Link to the same URL would be
                    intercepted again and land right back in this panel. */}
                <a
                  href={fullPageHref}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{labels.openPage}</span>
                </a>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  aria-label={labels.close}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:rotate-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div ref={panelRef} className="flex-1 overflow-y-auto overscroll-contain">
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.4,
                  delay: reduceMotion || swapping ? 0 : 0.12,
                  ease: EASE_OUT,
                }}
              >
                {children}
              </motion.div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
