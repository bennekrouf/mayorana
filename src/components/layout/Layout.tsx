import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
// import { useTheme } from 'next-themes';

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
  // const { theme } = useTheme();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Navbar />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
