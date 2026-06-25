'use client';

import { useEffect } from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Something went wrong!</h1>
        <p className="text-muted-foreground text-sm">
          An unexpected error occurred. We have logged this error and our team is looking into it.
        </p>
        {error.message && (
          <pre className="text-xs p-3 rounded-lg bg-muted border border-border text-left overflow-x-auto text-rose-600 max-h-32">
            <code>{error.message}</code>
          </pre>
        )}
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm shadow-md"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 border border-border text-foreground hover:bg-accent px-4 py-2.5 rounded-lg text-sm"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
