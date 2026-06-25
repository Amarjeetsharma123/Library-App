'use client';

import Link from 'next/link';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">404 - Page Not Found</h1>
        <p className="text-muted-foreground text-sm">
          Sorry, we couldn't find the page you are looking for. It might have been moved or deleted.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm shadow-md"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 border border-border text-foreground hover:bg-accent px-4 py-2.5 rounded-lg text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
