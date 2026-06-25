'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { requestLoginOtpAction } from '@/lib/actions/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (showOtpField && !otp) {
      setErrorMsg('Please enter the OTP sent to your email.');
      return;
    }

    setErrorMsg('');
    startTransition(async () => {
      try {
        if (!showOtpField) {
          // Perform pre-login verification checks and trigger OTP sending
          const res = await requestLoginOtpAction(email, password);
          if (!res.success) {
            setErrorMsg(res.message);
            toast.error(res.message);
          } else if (res.otpRequired) {
            setShowOtpField(true);
            toast.success('OTP sent to your email address!');
          }
        } else {
          // Verify and sign in
          const result = await signIn('credentials', {
            email,
            password,
            otp,
            redirect: false,
          });

          if (result?.error) {
            setErrorMsg('Invalid or expired OTP. Please try again.');
            toast.error('Invalid or expired OTP.');
          } else {
            toast.success('Successfully logged in!');
            router.push(callbackUrl);
            router.refresh();
          }
        }
      } catch (err: any) {
        setErrorMsg('An unexpected error occurred. Please try again.');
        toast.error('Login failed.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-center">
          {showOtpField ? 'Verify Login OTP' : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          {showOtpField ? (
            <span>We sent a 6-digit OTP code to your registered email address.</span>
          ) : (
            <>
              Or{' '}
              <Link href="/signup" className="font-semibold text-primary hover:opacity-90">
                create a new member account
              </Link>
            </>
          )}
        </p>
      </div>

      {errorMsg && (
        <div className="flex gap-2 items-start p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {!showOtpField ? (
          <>
            {/* Email */}
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
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-primary hover:opacity-90"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>Remember me</span>
              </label>
            </div>
          </>
        ) : (
          <>
            {/* OTP Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="otp" className="text-sm font-semibold text-foreground">
                  One-Time Password (OTP)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpField(false);
                    setOtp('');
                    setErrorMsg('');
                  }}
                  className="text-xs font-semibold text-primary hover:opacity-90"
                >
                  Change Email / Password
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm tracking-[0.3em] font-mono text-center text-lg"
                  placeholder="000000"
                />
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {isPending
            ? showOtpField
              ? 'Verifying...'
              : 'Signing in...'
            : showOtpField
            ? 'Verify & Sign In'
            : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-muted-foreground py-6">Loading form...</div>}>
      <LoginForm />
    </Suspense>
  );
}
