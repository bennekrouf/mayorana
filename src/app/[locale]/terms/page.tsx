// File: src/app/[locale]/terms/page.tsx
'use client';

import React from 'react';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';

export default function TermsOfServicePage() {
  return (
    <LayoutTemplate>
      <div className="py-20 bg-background">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
                <p>
                  By accessing and using the Mayorana website (mayorana.ch), you accept and agree to be bound by the
                  terms and provision of this agreement. These Terms of Service (&quot;Terms&quot;) govern your use of our website
                  and services provided by Mayorana, a Swiss-based technology consulting company.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Description of Services</h2>
                <p className="mb-4">Mayorana provides the following services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Rust programming training and consulting</li>
                  <li>Large Language Model (LLM) integration services</li>
                  <li>AI agent development</li>
                  <li>API solutions including api0.ai</li>
                  <li>Technology consulting and advisory services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Use License</h2>
                <p className="mb-4">
                  Permission is granted to temporarily download one copy of the materials on Mayorana&apos;s website for
                  personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
                <p className="mt-4">
                  This license shall automatically terminate if you violate any of these restrictions and may be
                  terminated by Mayorana at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Services</h2>
                <p className="mb-4">
                  For professional consulting and training services, separate service agreements will be established that include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Specific scope of work and deliverables</li>
                  <li>Payment terms and conditions</li>
                  <li>Intellectual property arrangements</li>
                  <li>Confidentiality and non-disclosure terms</li>
                  <li>Service level agreements and support terms</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
                <p className="mb-4">When using our website and services, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the confidentiality of any login credentials</li>
                  <li>Use services only for lawful purposes</li>
                  <li>Respect intellectual property rights</li>
                  <li>Not interfere with the operation of our website or services</li>
                  <li>Not attempt to gain unauthorized access to our systems</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
                <p>
                  The materials on Mayorana&apos;s website are provided on an &apos;as is&apos; basis. Mayorana makes no warranties,
                  expressed or implied, and hereby disclaims and negates all other warranties including without limitation,
                  implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement
                  of intellectual property or other violation of rights.
                </p>
                <p className="mt-4">
                  Further, Mayorana does not warrant or make any representations concerning the accuracy, likely results,
                  or reliability of the use of the materials on its website or otherwise relating to such materials or on
                  any sites linked to this site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Limitations of Liability</h2>
                <p>
                  In no event shall Mayorana or its suppliers be liable for any damages (including, without limitation,
                  damages for loss of data or profit, or due to business interruption) arising out of the use or inability
                  to use the materials on Mayorana&apos;s website, even if Mayorana or a Mayorana authorized representative has
                  been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not
                  allow limitations on implied warranties, or limitations of liability for consequential or incidental damages,
                  these limitations may not apply to you.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
                <p>
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your
                  information when you use our services. By using our services, you agree to the collection and use of
                  information in accordance with our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Third-Party Links and Services</h2>
                <p>
                  Our website may contain links to third-party websites or services (including api0.ai, social media platforms).
                  We are not responsible for the content, privacy policies, or practices of third-party sites. We encourage
                  you to read the terms and privacy policies of any third-party sites you visit.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
                <p className="mb-4">
                  The content, organization, graphics, design, and other matters related to the website are protected
                  under applicable copyrights and other proprietary laws. Copying, redistribution, use or publication
                  of any such matters or any part of the website is prohibited.
                </p>
                <p>
                  All trademarks, service marks, and trade names are proprietary to Mayorana or other respective owners.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless Mayorana and its affiliates, officers, agents, and employees
                  from any claim or demand, including reasonable attorneys&apos; fees, made by any third party due to or arising
                  out of your use of the website, your violation of these Terms, or your violation of any rights of another.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Termination</h2>
                <p>
                  We may terminate or suspend your access to our website and services immediately, without prior notice
                  or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
                <p>
                  These Terms shall be governed and construed in accordance with the laws of Switzerland, without regard
                  to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the
                  exclusive jurisdiction of the courts of Switzerland.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
                <p>
                  Mayorana reserves the right to modify these Terms at any time. We will notify users of any material
                  changes by posting the updated Terms on this page with a new revision date. Your continued use of the
                  website after such modifications will constitute acknowledgment and agreement to the modified Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Severability</h2>
                <p>
                  If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited
                  or eliminated to the minimum extent necessary so that the Terms will otherwise remain in full force and effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                <p className="mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-secondary p-4 rounded-lg">
                  <p><strong>Email:</strong> contact@mayorana.ch</p>
                  <p><strong>Address:</strong> Mayorana, Switzerland</p>
                  <p><strong>Website:</strong> mayorana.ch</p>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </LayoutTemplate>
  );
}
