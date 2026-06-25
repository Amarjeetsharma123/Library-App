'use client';

import React, { useActionState, useEffect, use } from 'react';
import Link from 'next/link';
import { resetPasswordAction } from '@/lib/actions/auth';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = use(params);
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);
  const [showPassword, setShowPassword] = React.useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || 'Password reset successful!');
    } else if (state?.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-center">
          Choose a new password
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Enter your new password below to reset your account credentials.
        </p>
      </div>

      {state?.success ? (
        <div className="space-y-6">
          <div className="flex gap-3 items-start p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold">Password Updated</h4>
              <p className="mt-1">{state.message}</p>
            </div>
          </div>
          <Link
            href="/login"
            className="w-full flex justify-center py-2.5 bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 rounded-lg shadow-md transition-colors"
          >
            Go to Login
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          {state?.success === false && state.message && (
            <div className="flex gap-2 items-start p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{state.message}</span>
            </div>
          )}

          <input type="hidden" name="token" value={token} />

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-foreground">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2.5 mt-6 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isPending ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}
