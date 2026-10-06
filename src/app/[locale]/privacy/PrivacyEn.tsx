'use client';

import React from 'react';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';

const link = 'text-primary hover:underline';

export default function PrivacyEn() {
  return (
    <LayoutTemplate>
      <div className="py-20 bg-background">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: 6 October 2026</p>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                <p>
                  Mayorana (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is a Swiss software company. This policy explains what
                  personal data we collect when you use the website mayorana.ch and the desktop tools downloaded from it,
                  why we collect it, and what you can ask us to do with it.
                </p>
                <p className="mt-4">
                  api0, our MCP gateway, is covered by its own{' '}
                  <a href="https://api0.ai/privacy" target="_blank" rel="noopener noreferrer" className={link}>
                    privacy policy
                  </a>
                  , not by this one.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Information You Give Us</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Contact and founding-user forms:</strong> your name, email address, company (optional), the
                    topic you chose and your message.
                  </li>
                  <li>
                    <strong>Optional sign-in</strong> with Google or GitHub: your email address, name and account
                    identifier, as provided by that service. Sign-in is never required to download a tool.
                  </li>
                  <li>
                    <strong>Purchases</strong> of a paid edition: your email address and the licence issued to you. Card
                    details are entered on Stripe&apos;s payment page and never reach us.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Information Collected Automatically</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Website analytics</strong> through Plausible Analytics, which does not use cookies and does not
                    collect personal data. We see aggregate figures such as page views and referring sites.
                  </li>
                  <li>
                    <strong>Server logs.</strong> Like any web server, ours records each request: IP address, time, page or
                    file requested, browser user agent and referring page. These logs are deleted after about two weeks.
                    Before that, a nightly job turns them into daily totals (downloads per tool, referring sites, countries);
                    the totals contain no IP addresses.
                  </li>
                  <li>
                    <strong>Where you came from.</strong> On your first visit, the site stores in your browser the site or
                    campaign that brought you (for example a utm_source tag). It is added to download links, so a download
                    can be counted against the channel that found you. It contains nothing about you.
                  </li>
                  <li>
                    <strong>When you are signed in</strong>, we record which tools you downloaded, for which operating
                    system and when, and keep a backup of your reading progress on the blog.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Desktop Tools</h2>
                <p className="mb-4">
                  Some desktop tools send anonymous usage statistics. This is on by default: the app tells you once, in a
                  notice at the bottom of its window, and sends nothing before you have seen it. You can turn it off from
                  that notice or, in apps that have one, from their settings; either also deletes anything not yet sent.
                  Setting DO_NOT_TRACK or DISABLE_UPDATE_CHECK in your environment turns it off in every app. Each report
                  contains a random installation identifier created on your machine, the app&apos;s name and version, your
                  operating system, and which features were used and whether they succeeded (for GitAgent, also the type of
                  Git host and AI provider you chose). Reports reach us as requests to mayorana.ch, so they appear in the
                  server logs described above, which are deleted after about two weeks. What we keep are daily totals, never
                  figures per installation.
                </p>
                <p>
                  Each tool&apos;s Claude skill can draft a bug report for you. You review it and send it yourself; nothing
                  is sent automatically.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To answer your messages and provide support</li>
                  <li>To issue and deliver licences you buy</li>
                  <li>To contact founding users about the tools they use, as described when you sign in</li>
                  <li>To send you information about our products, only if you opt in</li>
                  <li>To understand which tools and pages are used, so we know what to improve</li>
                  <li>To comply with legal obligations</li>
                </ul>
                <p className="mt-4">We do not sell, trade or rent your personal data.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Service Providers</h2>
                <p className="mb-4">We rely on these providers, each of which processes data under its own privacy policy:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Google Firebase Authentication, and Google or GitHub, for sign-in</li>
                  <li>Stripe, for payments</li>
                  <li>Plausible Analytics, for website analytics</li>
                </ul>
                <p className="mt-4">
                  Forms, sign-in data and licences are handled by the api0 gateway (gateway.api0.ai), which we operate.
                  We may also disclose data when the law requires it, or to protect our rights or safety.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Cookies and Browser Storage</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your light or dark theme</li>
                  <li>Your reading progress on the blog</li>
                  <li>The channel that first brought you to the site (see above)</li>
                  <li>Your sign-in session, if you sign in</li>
                </ul>
                <p className="mt-4">We do not use advertising cookies or third-party tracking.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Form messages: typically 2 years, unless you ask us to delete them sooner</li>
                  <li>Account data (downloads, reading progress): for as long as you keep your account, or until you ask us to delete it</li>
                  <li>Server logs: about two weeks</li>
                  <li>Purchase records: as long as the law requires us to keep them</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal data
                  against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
                  over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                <p className="mb-4">
                  Under the Swiss Federal Act on Data Protection and, where it applies, the EU General Data Protection
                  Regulation, you have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal data</li>
                  <li>Have inaccurate data corrected</li>
                  <li>Have your data deleted</li>
                  <li>Restrict or object to processing</li>
                  <li>Receive your data in a portable format</li>
                  <li>Withdraw your consent at any time</li>
                </ul>
                <p className="mt-4">To exercise any of these, write to contact@mayorana.ch.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
                <p>
                  We are based in Switzerland. Some of the providers above, such as Google, GitHub and Stripe, may process
                  data outside Switzerland, including in the United States. Such transfers rely on the safeguards those
                  providers offer under applicable data protection law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Third-Party Links</h2>
                <p>
                  The site links to services such as GitHub, LinkedIn and WhatsApp. They have their own privacy policies,
                  and we are not responsible for their practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
                <p>
                  We may update this privacy policy from time to time. We will notify you of any material changes by
                  posting the new policy on this page with an updated revision date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this privacy policy or our data practices, please contact us:
                </p>
                <div className="bg-secondary p-4 rounded-lg">
                  <p><strong>Email:</strong> contact@mayorana.ch</p>
                  <p><strong>Address:</strong> Mayorana, Switzerland</p>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </LayoutTemplate>
  );
}
