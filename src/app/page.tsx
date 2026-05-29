import { redirect } from 'next/navigation';

export default function RootRedirectPage() {
  // Middleware handles locale detection and redirect.
  // This is a fallback in case middleware doesn't catch it.
  redirect('/en');
}
