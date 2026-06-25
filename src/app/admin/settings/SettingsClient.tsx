'use client';

import React, { useState, useTransition } from 'react';
import { updateSettingsAction } from '@/lib/actions/library';
import { toast } from 'sonner';
import { Settings, HelpCircle, Save } from 'lucide-react';

interface SettingsClientProps {
  initialSettings: {
    libraryName: string;
    loanDurationDays: number;
    finePerDay: number;
    maxBooksPerMember: number;
  };
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [libraryName, setLibraryName] = useState(initialSettings.libraryName);
  const [loanDurationDays, setLoanDurationDays] = useState(initialSettings.loanDurationDays);
  const [finePerDay, setFinePerDay] = useState(initialSettings.finePerDay);
  const [maxBooksPerMember, setMaxBooksPerMember] = useState(initialSettings.maxBooksPerMember);
  const [isPending, startTransition] = useTransition();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await updateSettingsAction({
        libraryName,
        loanDurationDays: Number(loanDurationDays),
        finePerDay: Number(finePerDay),
        maxBooksPerMember: Number(maxBooksPerMember),
      });

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Library Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global parameters, borrowing thresholds, and overdue fine accumulation policies.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Library Name */}
          <div className="space-y-2">
            <label htmlFor="lib-name" className="text-sm font-semibold">Library System Name</label>
            <input
              id="lib-name"
              type="text"
              required
              value={libraryName}
              onChange={(e) => setLibraryName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Loan Duration */}
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-semibold">Loan Duration (Days)</label>
              <input
                id="duration"
                type="number"
                required
                min={1}
                value={loanDurationDays}
                onChange={(e) => setLoanDurationDays(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            {/* Fine Per Day */}
            <div className="space-y-2">
              <label htmlFor="fine" className="text-sm font-semibold">Fine Rate Per Day ($)</label>
              <input
                id="fine"
                type="number"
                step="0.01"
                required
                min={0}
                value={finePerDay}
                onChange={(e) => setFinePerDay(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            {/* Max Books */}
            <div className="space-y-2">
              <label htmlFor="max-books" className="text-sm font-semibold">Max Books Per Member</label>
              <input
                id="max-books"
                type="number"
                required
                min={1}
                value={maxBooksPerMember}
                onChange={(e) => setMaxBooksPerMember(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 items-start p-4 rounded-lg bg-accent/40 border border-border text-muted-foreground text-xs leading-relaxed">
            <HelpCircle className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span>
              Updating these values will apply immediately to any newly created borrow records. Fines are accumulated daily based on the active rate specified above.
            </span>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Save className="h-4 w-4" />
            {isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
