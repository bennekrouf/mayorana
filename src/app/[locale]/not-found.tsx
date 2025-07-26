import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';

export default function NotFound() {
  return (
    <LayoutTemplate>
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20">
        <div className="container text-center">
          <h1 className="text-6xl font-bold mb-6">404</h1>
          <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </LayoutTemplate>
  );
}
