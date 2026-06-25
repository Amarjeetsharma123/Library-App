'use client';

import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/lib/actions/auth';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success('Password reset link sent!');
    } else if (state?.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-center">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Enter your email address and we will send you a link to reset your password.
        </p>
      </div>

      {state?.success ? (
        <div className="space-y-6">
          <div className="flex gap-3 items-start p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold">Reset Link Sent</h4>
              <p className="mt-1">{state.message}</p>
            </div>
          </div>
          <Link
            href="/login"
            className="w-full flex justify-center py-2.5 rounded-lg border border-border text-foreground text-sm font-semibold hover:bg-accent transition-colors"
          >
            Return to login
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-6">
          {state?.success === false && state.message && (
            <div className="flex gap-2 items-start p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{state.message}</span>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-foreground">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isPending ? 'Sending link...' : 'Send reset link'}
          </button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
