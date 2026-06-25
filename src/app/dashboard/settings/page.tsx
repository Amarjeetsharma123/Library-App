'use client';

import React from 'react';
import { Sliders, Bell, Eye, EyeOff, ShieldAlert, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Preferences</h1>
        <p className="text-muted-foreground mt-1">Manage notifications, app theme, and account deletion settings.</p>
      </div>

      {/* Account Preferences */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold border-b border-border pb-4">App Preferences</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">Email Reminders</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Receive email notices 3 days before book due dates.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                onChange={() => toast.success('Preference updated.')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <h4 className="font-semibold text-sm">Fine Alert Notifications</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Notify me inside the dashboard whenever a late fee is calculated.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                onChange={() => toast.success('Preference updated.')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-rose-500/20 rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-rose-500 border-b border-rose-500/10 pb-4 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Danger Zone
        </h2>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h4 className="font-semibold text-sm text-foreground">Delete Account</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete your member profile and clear all records. This action is irreversible.
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to permanently delete your library account?')) {
                toast.error('Account deletion requires contacting library admin staff.');
              }
            }}
            className="flex items-center gap-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-4 py-2.5 rounded-lg text-xs font-semibold shrink-0 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
