import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-indigo-50/50 via-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-slate-900 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl">
          <BookOpen className="h-8 w-8 stroke-[2.5]" />
          <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            LibSphere
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border border-border px-4 py-8 shadow-xl rounded-2xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
