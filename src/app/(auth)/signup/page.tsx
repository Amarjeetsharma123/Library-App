'use client';

import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { signUpAction } from '@/lib/actions/auth';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, null);
  const [showPassword, setShowPassword] = React.useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || 'Account created successfully!');
    } else if (state?.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-center">
          Create a new account
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Or{' '}
          <Link href="/login" className="font-semibold text-primary hover:opacity-90">
            sign in to your existing account
          </Link>
        </p>
      </div>

      {state?.success && (
        <div className="flex gap-3 items-start p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold">Verification Email Sent!</h4>
            <p className="mt-1">{state.message}</p>
          </div>
        </div>
      )}

      {state?.success === false && state.message && (
        <div className="flex gap-2 items-start p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{state.message}</span>
        </div>
      )}

      {!state?.success && (
        <form action={formAction} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-semibold text-foreground">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <User className="h-5 w-5" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="John Doe"
              />
            </div>
            {state?.errors?.name && (
              <p className="text-xs text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
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
            {state?.errors?.email && (
              <p className="text-xs text-destructive">{state.errors.email[0]}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-foreground">
              Password
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
            {state?.errors?.password && (
              <p className="text-xs text-destructive">{state.errors.password[0]}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
              Confirm Password
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
            {state?.errors?.confirmPassword && (
              <p className="text-xs text-destructive">{state.errors.confirmPassword[0]}</p>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="space-y-1.5 pt-2">
            <label className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                name="terms"
                required
                className="h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
              />
              <span>
                I agree to the{' '}
                <Link href="#" className="font-semibold text-primary hover:opacity-90">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="font-semibold text-primary hover:opacity-90">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {state?.errors?.terms && (
              <p className="text-xs text-destructive">{state.errors.terms[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2.5 mt-6 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isPending ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
      )}
    </div>
  );
}
