import Link from 'next/link';

// Unknown paths outside a locale. The middleware usually redirects those into
// /en or /fr first; this is the fallback, and with a pass-through root layout
// it has to render its own document.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 font-sans antialiased">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <Link href="/en" className="text-primary underline underline-offset-4">
          Go to mayorana.ch
        </Link>
      </body>
    </html>
  );
}
