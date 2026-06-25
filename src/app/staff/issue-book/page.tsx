'use client';

import React, { useState, useTransition } from 'react';
import { issueBookAction } from '@/lib/actions/library';
import { toast } from 'sonner';
import { PlusCircle, Mail, BookOpen, AlertTriangle } from 'lucide-react';

export default function IssueBookPage() {
  const [memberEmail, setMemberEmail] = useState('');
  const [bookIsbn, setBookIsbn] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail || !bookIsbn) {
      toast.error('Please fill in all fields.');
      return;
    }

    startTransition(async () => {
      const res = await issueBookAction(memberEmail, bookIsbn);
      if (res.success) {
        toast.success(res.message);
        setBookIsbn('');
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Issue Book</h1>
        <p className="text-muted-foreground mt-1">Lend a book copy to a library member by supplying details.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
        <form onSubmit={handleIssue} className="space-y-6">
          <div className="flex gap-3 items-start p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-indigo-650 dark:text-indigo-400 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold">Borrowing Rules</h4>
              <p className="text-xs mt-1">
                Before issuing, ensure the member has no outstanding fines. The maximum books a member can borrow is capped based on settings.
              </p>
            </div>
          </div>

          {/* Member Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-foreground">
              Member Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="reader@gmail.com"
              />
            </div>
          </div>

          {/* Book ISBN */}
          <div className="space-y-2">
            <label htmlFor="isbn" className="text-sm font-semibold text-foreground">
              Book ISBN
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <input
                id="isbn"
                type="text"
                required
                value={bookIsbn}
                onChange={(e) => setBookIsbn(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="9780451524935"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isPending ? 'Processing Loan...' : 'Issue Book Copy'}
          </button>
        </form>
      </div>
    </div>
  );
}
