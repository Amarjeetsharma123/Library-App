import { verifyEmailAction } from '@/lib/actions/auth';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';

interface VerifyEmailPageProps {
  params: Promise<{ token: string }>;
}

export const metadata = {
  title: 'Email Verification | LibSphere',
};

export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const { token } = await params;
  const result = await verifyEmailAction(token);

  return (
    <div className="space-y-6 text-center">
      {result.success ? (
        <div className="space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Email Verified!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {result.message}
            </p>
          </div>
          <Link
            href="/login"
            className="w-full flex justify-center py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:opacity-90 transition-all"
          >
            Sign In Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
            <XCircle className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Verification Failed
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {result.message}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/signup"
              className="flex justify-center py-2.5 rounded-lg border border-border text-foreground font-semibold text-sm hover:bg-accent transition-colors"
            >
              Sign Up Again
            </Link>
            <Link
              href="/"
              className="flex justify-center py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
