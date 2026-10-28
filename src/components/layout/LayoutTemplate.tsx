'use client';

import React, { ViewTransition } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

interface LayoutTemplateProps {
  children: React.ReactNode;
}

const LayoutTemplate: React.FC<LayoutTemplateProps> = ({
  children
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Only the page content takes part in the cross-fade between pages;
          the navbar and footer stay put. */}
      <main className="flex-grow">
        <ViewTransition>{children}</ViewTransition>
      </main>

      <Footer />

      {/* WhatsApp Button - only visible on mobile */}
      <WhatsAppButton />
    </div>
  );
};

export default LayoutTemplate;
