// swissrust.ch: the Rust half of the blog under its own name. The middleware
// rewrites every swissrust.ch request into this segment, which is how the
// navbar and footer know which site they are on. Knowing it from the route,
// rather than from the Host header, keeps every page here prerenderable.
//
// The pages below re-export mayorana.ch's blog pages; only the listing differs
// (no featured AI posts), and it takes the site as a prop. Canonicals still
// point at mayorana.ch, so the two sites never compete in search.

import { HostProvider } from '@/providers/HostProvider';

export default function SwissRustLayout({ children }: { children: React.ReactNode }) {
  return <HostProvider isSwissRust>{children}</HostProvider>;
}
