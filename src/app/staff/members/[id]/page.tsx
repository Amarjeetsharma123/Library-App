import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import { format } from 'date-fns';
import { User, Book, Calendar, DollarSign } from 'lucide-react';

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Member Details | LibSphere',
};

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { id } = await params;

  const member = await db.user.findUnique({
    where: { id },
    include: {
      borrowRecords: {
        include: {
          book: true,
        },
        orderBy: { issueDate: 'desc' },
      },
      fines: {
        orderBy: { id: 'desc' },
      },
    },
  });

  if (!member) {
    notFound();
  }

  const activeLoans = member.borrowRecords.filter((r) => r.status === 'ISSUED' || r.status === 'OVERDUE');
  const pastLoans = member.borrowRecords.filter((r) => r.status === 'RETURNED');
  const unpaidFines = member.fines.filter((f) => !f.isPaid);
  const totalUnpaidFines = unpaidFines.reduce((acc, f) => acc + Number(f.amount), 0);

  return (
    <div className="space-y-8">
      {/* Back link */}
      <div>
        <Link href="/staff/members" className="text-sm font-semibold text-primary hover:opacity-90">
          &larr; Back to Members list
        </Link>
      </div>

      {/* Member summary info card */}
      <div className="bg-card border border-border p-6 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-muted border border-border shrink-0">
            <img
              src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{member.name}</h1>
            <p className="text-sm text-muted-foreground">{member.email}</p>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block mt-1">
              Joined on: {format(member.createdAt, 'PP')}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-4 py-2 border rounded-lg bg-card">
            <span className="block text-xl font-bold text-foreground">{activeLoans.length}</span>
            <span className="text-xs text-muted-foreground">Active Loans</span>
          </div>
          <div className="text-center px-4 py-2 border rounded-lg bg-card">
            <span className="block text-xl font-bold text-rose-500">${totalUnpaidFines.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">Unpaid Fines</span>
          </div>
        </div>
      </div>

      {/* Active Borrowed Books */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold border-b border-border pb-4 mb-4">Currently Borrowed Books</h2>
        {activeLoans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-foreground">{loan.book.title}</td>
                    <td className="py-4 px-4 text-muted-foreground">{format(loan.issueDate, 'PP')}</td>
                    <td className="py-4 px-4 text-muted-foreground">{format(loan.dueDate, 'PP')}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          loan.status === 'OVERDUE'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No current active checkouts for this member.</p>
        )}
      </div>

      {/* Borrow History */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold border-b border-border pb-4 mb-4">Borrowing History</h2>
        {pastLoans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4">Fine Charged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pastLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 px-4">{loan.book.title}</td>
                    <td className="py-4 px-4 text-muted-foreground">{format(loan.issueDate, 'PP')}</td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {loan.returnDate ? format(loan.returnDate, 'PP') : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {Number(loan.fineAmount) > 0 ? `$${Number(loan.fineAmount).toFixed(2)}` : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No borrowing history on record.</p>
        )}
      </div>
    </div>
  );
}
