import { auth } from '@/auth';
import { db } from '@/lib/db';
import EmptyState from '@/components/ui/EmptyState';
import { BookOpen, Calendar, HelpCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export const metadata = {
  title: 'My Borrowed Books | LibSphere',
};

export default async function MyBooksPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const records = await db.borrowRecord.findMany({
    where: { userId },
    include: {
      book: {
        include: { author: true },
      },
    },
    orderBy: { issueDate: 'desc' },
  });

  const activeRecords = records.filter((r) => r.status === 'ISSUED' || r.status === 'OVERDUE');
  const pastRecords = records.filter((r) => r.status === 'RETURNED');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Borrowed Books</h1>
        <p className="text-muted-foreground mt-1">Track books currently borrowed and review your checkout history.</p>
      </div>

      {/* Currently Checked Out */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold border-b border-border pb-4 mb-4">Currently Borrowed</h2>
        {activeRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Accumulated Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeRecords.map((rec) => {
                  const isOverdue = rec.status === 'OVERDUE';
                  return (
                    <tr key={rec.id} className="hover:bg-accent/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-foreground">
                        <div>
                          <span>{rec.book.title}</span>
                          <span className="block text-xs font-normal text-muted-foreground">by {rec.book.author.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{format(rec.issueDate, 'PP')}</td>
                      <td className="py-4 px-4 text-muted-foreground">{format(rec.dueDate, 'PP')}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            isOverdue
                              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                              : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                          }`}
                        >
                          {isOverdue ? 'Overdue' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold">
                        {Number(rec.fineAmount) > 0 ? (
                          <span className="text-rose-600">${Number(rec.fineAmount).toFixed(2)}</span>
                        ) : (
                          <span className="text-muted-foreground">$0.00</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">You have no active checkouts.</p>
        )}
      </div>

      {/* Borrowing History */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold border-b border-border pb-4 mb-4">Checkout History</h2>
        {pastRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Fine Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pastRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-semibold text-foreground">{rec.book.title}</span>
                        <span className="block text-xs text-muted-foreground">by {rec.book.author.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{format(rec.issueDate, 'PP')}</td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {rec.returnDate ? format(rec.returnDate, 'PP') : 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Returned
                      </span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {Number(rec.fineAmount) > 0 ? `$${Number(rec.fineAmount).toFixed(2)}` : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No historical borrow records found.</p>
        )}
      </div>
    </div>
  );
}
