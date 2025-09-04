// File: src/app/[locale]/privacy/page.tsx
'use client';

import React from 'react';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';

export default function PrivacyPolicyPage() {
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
            <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                <p>
                  Mayorana (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data.
                  This privacy policy explains how we collect, use, and safeguard your information when you visit our website
                  mayorana.ch (the &quot;Service&quot;).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>

                <h3 className="text-xl font-medium mb-3">Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Contact information (name, email address, company name)</li>
                  <li>Messages and communications you send through our contact forms</li>
                  <li>Service preferences and inquiries</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Usage data and analytics (via Plausible Analytics - privacy-focused, no personal data)</li>
                  <li>Browser type and version</li>
                  <li>Device information and IP address (anonymized)</li>
                  <li>Pages visited and time spent on our website</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                <p className="mb-4">We use the collected information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Improve our website and services</li>
                  <li>Send you information about our services (only if you opt-in)</li>
                  <li>Analyze website usage to enhance user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
                <p className="mb-4">We do not sell, trade, or rent your personal information. We may share information only in these limited circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal requirements or court orders</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>With trusted service providers who assist in operating our website (under strict confidentiality agreements)</li>
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
                <h2 className="text-2xl font-semibold mb-4">Your Rights (GDPR)</h2>
                <p className="mb-4">If you are a resident of the European Economic Area, you have the following rights:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Right to access your personal data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                  <li>Right to withdraw consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
                <p className="mb-4">We use minimal tracking technologies:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Plausible Analytics: Privacy-focused analytics that doesn&apos;t use cookies or collect personal data</li>
                  <li>Essential cookies for website functionality</li>
                  <li>Theme preferences (light/dark mode)</li>
                </ul>
                <p>We do not use advertising cookies or third-party tracking systems.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
                <p>
                  We retain your personal data only as long as necessary to fulfill the purposes outlined in this policy,
                  comply with legal obligations, or resolve disputes. Contact form submissions are typically retained for
                  2 years unless you request earlier deletion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
                <p className="mb-4">Our website may contain links to third-party services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>api0.ai (our own service)</li>
                  <li>Social media platforms (LinkedIn, GitHub)</li>
                  <li>WhatsApp (for contact)</li>
                </ul>
                <p>These services have their own privacy policies, and we are not responsible for their practices.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
                <p>
                  As we are based in Switzerland, your data is primarily processed within Switzerland and the European Economic Area.
                  Any international transfers comply with applicable data protection laws and appropriate safeguards.
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
