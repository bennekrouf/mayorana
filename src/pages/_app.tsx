import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '../components/ThemeProvider';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
