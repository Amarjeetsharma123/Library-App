import { db } from '@/lib/db';
import { updateOverdueLoans, returnBookAction } from '@/lib/actions/library';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import { BookOpen, AlertCircle, HelpCircle, CheckCircle2, UserCheck, RefreshCw } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'Staff Portal Overview | LibSphere',
};

export default async function StaffOverviewPage() {
  // Update overdue borrow status and calculate outstanding fines
  await updateOverdueLoans();

  const today = startOfDay(new Date());

  // Fetch Stats
  const [issuedToday, returnedToday, totalOverdue] = await Promise.all([
    db.borrowRecord.count({
      where: {
        issueDate: { gte: today },
      },
    }),
    db.borrowRecord.count({
      where: {
        returnDate: { gte: today },
      },
    }),
    db.borrowRecord.count({
      where: {
        status: 'OVERDUE',
      },
    }),
  ]);

  // Fetch Overdue Records List
  const overdueRecords = await db.borrowRecord.findMany({
    where: {
      status: 'OVERDUE',
    },
    include: {
      book: true,
      user: true,
    },
    orderBy: { dueDate: 'asc' },
    take: 5,
  });

  // Recent Actions Transactions
  const recentTransactions = await db.borrowRecord.findMany({
    include: {
      book: true,
      user: true,
    },
    orderBy: { issueDate: 'desc' },
    take: 5,
  });

  const handleReturn = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    await returnBookAction(id);
    revalidatePath('/staff');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Librarian Staff Overview</h1>
        <p className="text-muted-foreground mt-1">Manage daily operations: issue books, process returns, and track overdue logs.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Issued Today"
          value={issuedToday}
          description="Checkouts processed today"
          icon={UserCheck}
          color="text-indigo-655 bg-indigo-500/10"
        />
        <StatCard
          title="Returned Today"
          value={returnedToday}
          description="Returns processed today"
          icon={RefreshCw}
          color="text-emerald-600 bg-emerald-500/10"
        />
        <StatCard
          title="Total Overdue Books"
          value={totalOverdue}
          description="Requires follow-up"
          icon={AlertCircle}
          color={totalOverdue > 0 ? 'text-rose-600 bg-rose-500/10' : 'text-slate-600 bg-slate-500/10'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Overdue loans action list */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold border-b border-border pb-4 mb-4 text-rose-550 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Critical Overdue Loans
            </h2>

            {overdueRecords.length > 0 ? (
              <div className="divide-y divide-border">
                {overdueRecords.map((rec) => (
                  <div key={rec.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                    <div className="truncate">
                      <h4 className="font-semibold text-sm truncate">{rec.book.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Borrowed by: <strong className="text-foreground">{rec.user.name}</strong>
                      </p>
                      <span className="block text-xs mt-1 font-semibold text-rose-500">
                        Due: {format(rec.dueDate, 'PP')} (${Number(rec.fineAmount).toFixed(2)} fine)
                      </span>
                    </div>
                    <form action={handleReturn}>
                      <input type="hidden" name="id" value={rec.id} />
                      <button
                        type="submit"
                        className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors"
                      >
                        Return
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No active overdue books! All clean.</p>
            )}
          </div>
        </div>

        {/* Recent Transactions list */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
              <h2 className="text-lg font-bold">Recent Borrow Actions</h2>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="divide-y divide-border">
                {recentTransactions.map((rec) => (
                  <div key={rec.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                    <div className="truncate">
                      <h4 className="font-semibold text-sm truncate">{rec.book.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Member: <strong className="text-foreground">{rec.user.name}</strong>
                      </p>
                      <span className="block text-[10px] text-muted-foreground">
                        Issued: {format(rec.issueDate, 'PP')}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        rec.returnDate
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : rec.status === 'OVERDUE'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                      }`}
                    >
                      {rec.returnDate ? 'Returned' : rec.status === 'OVERDUE' ? 'Overdue' : 'Issued'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No borrow activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
