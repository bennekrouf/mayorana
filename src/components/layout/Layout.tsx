import React from 'react';
import Head from 'next/head';
import Script from 'next/script';  // Import the Script component
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '../ui/WhatsAppButton';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = "Mayorana | Rust, AI, and API Solutions",
  description = "Empowering Innovation with Rust, AI, and API Solutions" 
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Remove any script tags from Head */}
      </Head>
      
      {/* Use Script component for Plausible */}
      <Script 
        src="https://plausible.io/js/script.hash.outbound-links.js" 
        data-domain="mayorana.ch" 
        strategy="afterInteractive"
      />
      
      {/* Use Script component for setup code */}
      <Script id="plausible-setup" strategy="afterInteractive">
        {`
          window.plausible = window.plausible || function() { 
            (window.plausible.q = window.plausible.q || []).push(arguments);
          };
        `}
      </Script>
      
      <Navbar />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
      
      {/* WhatsApp Button - only visible on mobile */}
      <WhatsAppButton />
    </div>
  );
};

export default Layout;
