import "./globals.css";

// Pass-through root layout. Each top-level section renders its own <html> and
// <body> — [locale]/layout.tsx for the site, admin/ and stats/ for the tools —
// so the document is never nested inside a second one. The pages left at this
// level only redirect into a locale.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
