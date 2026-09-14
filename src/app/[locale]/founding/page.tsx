'use client';

// The founding-users offer, in full.
//
// Linked from the in-app notice and from the download panel, so most people
// arriving here are already running a tool. The page has one job: turn "I
// downloaded it" into a person we can talk to and two honest answers — what
// they were trying to do, and what would make it worth paying for. Those two
// answers are the positioning and pricing input the download logs cannot give.
//
// Sign-in is asked for first and made the obvious path, but the form still
// sends without it: an answer from someone who won't sign in beats no answer.

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { FiCheck, FiGift, FiMessageCircle, FiZap } from 'react-icons/fi';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';
import { useAuth } from '@/providers/AuthProvider';
import { GATEWAY_URL, updateUserPrefs } from '@/lib/gateway';
import { desktopToolsConfig } from '@/data/tools';
import { getLocalizedPath } from '@/lib/i18n-utils';

interface FormData {
  name: string;
  email: string;
  tool: string;
  use: string;
  pay: string;
}

function FoundingContent() {
  const t = useTranslations('founding');
  const locale = useLocale();
  const { enabled, user, loading, signInWithGoogle } = useAuth();
  const searchParams = useSearchParams();

  // The in-app notice and the download panel can pass ?tool=<id>, so the
  // first question is already answered for most visitors.
  const toolParam = searchParams.get('tool');
  const knownTool = desktopToolsConfig.some((tool) => tool.id === toolParam) ? toolParam! : '';

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  // Set after mount rather than as a default: the page is server-rendered
  // without the query string, and react-hook-form only reads defaults once.
  React.useEffect(() => {
    if (knownTool) setValue('tool', knownTool);
  }, [knownTool, setValue]);

  // Signed in: the identity fields are known, so they are filled and locked.
  // The email on the message is then the one on the account — the one the
  // gateway keyed the founding-user record on.
  React.useEffect(() => {
    if (!user) return;
    if (user.displayName) setValue('name', user.displayName);
    if (user.email) setValue('email', user.email);
  }, [user, setValue]);

  const onSubmit = async (data: FormData) => {
    setStatus('sending');
    const toolName = desktopToolsConfig.find((tool) => tool.id === data.tool)?.name ?? data.tool;
    const message = [
      `Tool: ${toolName || '(not specified)'}`,
      `Signed in: ${user ? `yes (${user.email})` : 'no'}`,
      '',
      'What were you trying to do — and does it do it?',
      data.use,
      '',
      'What would have to be true for you to pay for it?',
      data.pay,
    ].join('\n');

    try {
      const response = await fetch(`${GATEWAY_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          service: 'founding-user',
          message,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Best-effort: the thank-you must not wait on the bookkeeping. The
      // email above is the record that matters; this just marks the account.
      if (user) {
        void updateUserPrefs({
          founding_user: true,
          feedback_at: new Date().toISOString(),
          feedback_tool: data.tool || null,
        }).catch(() => {});
      }
      setStatus('sent');
    } catch (error) {
      console.error('[Founding] submit failed:', error);
      setStatus('error');
    }
  };

  const inputClasses =
    'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-70';

  return (
    <LayoutTemplate>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">{t('hero_kicker')}</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">{t('hero_title')}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{t('hero_body')}</p>
          </motion.div>
        </div>
      </section>

      {/* The deal, both sides */}
      <section className="py-12">
        <div className="container max-w-3xl grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-semibold mb-4">
              <FiGift className="text-primary" /> {t('what_you_get_title')}
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {(['what_you_get_1', 'what_you_get_2', 'what_you_get_3'] as const).map((key) => (
                <li key={key} className="flex gap-2">
                  <FiCheck className="mt-0.5 shrink-0 text-primary" /> <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-semibold mb-4">
              <FiMessageCircle className="text-primary" /> {t('what_we_ask_title')}
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {(['what_we_ask_1', 'what_we_ask_2'] as const).map((key) => (
                <li key={key} className="flex gap-2">
                  <FiZap className="mt-0.5 shrink-0 text-primary" /> <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12 pb-24">
        <div className="container max-w-3xl space-y-8">
          {status === 'sent' ? (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">{t('thanks_title')}</h2>
              <p className="text-muted-foreground mb-6">{t('thanks_body')}</p>
              <Link
                href={getLocalizedPath(locale, '/apps')}
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
              >
                {t('thanks_apps')}
              </Link>
            </div>
          ) : (
            <>
              {/* Step 1 — sign in. Hidden entirely if the build has no auth. */}
              {enabled && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="font-semibold mb-1">{t('signin_title')}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{t('signin_body')}</p>
                  {loading ? (
                    <div className="h-11" aria-hidden />
                  ) : user ? (
                    <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                      <FiCheck /> {t('signed_in', { email: user.email ?? '' })}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={signInWithGoogle}
                      className="inline-flex items-center gap-3 px-5 py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                        <path fill="currentColor" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
                      </svg>
                      {t('signin_button')}
                    </button>
                  )}
                </div>
              )}

              {/* Step 2 — the two questions */}
              <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card p-6 space-y-5">
                <h2 className="font-semibold">{t('form_title')}</h2>

                <div>
                  <label htmlFor="tool" className="block text-sm font-medium mb-1.5">{t('q_tool_label')}</label>
                  <select id="tool" {...register('tool')} className={inputClasses}>
                    <option value="">{t('q_tool_placeholder')}</option>
                    {desktopToolsConfig.map((tool) => (
                      <option key={tool.id} value={tool.id}>{tool.name}</option>
                    ))}
                    <option value="other">{t('q_tool_other')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="use" className="block text-sm font-medium mb-1.5">{t('q_use_label')}</label>
                  <textarea
                    id="use"
                    rows={4}
                    placeholder={t('q_use_placeholder')}
                    {...register('use', { required: true, maxLength: 2000 })}
                    className={inputClasses}
                  />
                  {errors.use && <p className="mt-1 text-xs text-red-600">Required</p>}
                </div>

                <div>
                  <label htmlFor="pay" className="block text-sm font-medium mb-1.5">{t('q_pay_label')}</label>
                  <textarea
                    id="pay"
                    rows={4}
                    placeholder={t('q_pay_placeholder')}
                    {...register('pay', { required: true, maxLength: 2000 })}
                    className={inputClasses}
                  />
                  {errors.pay && <p className="mt-1 text-xs text-red-600">Required</p>}
                </div>

                {/* Identity: locked to the account when signed in, asked for
                    otherwise — the contact endpoint needs both to deliver. */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1.5">{t('name_label')}</label>
                    <input
                      id="name"
                      type="text"
                      readOnly={!!user}
                      {...register('name', { required: true, maxLength: 100 })}
                      className={inputClasses}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">Required</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5">{t('email_label')}</label>
                    <input
                      id="email"
                      type="email"
                      readOnly={!!user}
                      {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
                      className={inputClasses}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">Required</p>}
                  </div>
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-600">{t('error')}</p>
                )}

                {enabled && !user && !loading ? (
                  // Not signed in: the submit is the quiet option, in words
                  // rather than as a button, so the sign-in above stays the
                  // obvious path — but it is a real submit, not a dead end.
                  <p className="text-sm text-muted-foreground">
                    {t('sign_in_first')}{' '}
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="underline underline-offset-2 hover:text-foreground disabled:opacity-60"
                    >
                      {status === 'sending' ? t('sending') : t('send_anyway')}
                    </button>
                    .
                  </p>
                ) : (
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
                  >
                    {status === 'sending' ? t('sending') : t('submit')}
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </section>
    </LayoutTemplate>
  );
}

export default function FoundingPage() {
  return (
    <Suspense fallback={null}>
      <FoundingContent />
    </Suspense>
  );
}
