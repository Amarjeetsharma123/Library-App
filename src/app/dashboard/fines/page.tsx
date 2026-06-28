import { auth } from '@/auth';
import { db } from '@/lib/db';
import EmptyState from '@/components/ui/EmptyState';
import RazorpayPayButton from '@/components/ui/RazorpayPayButton';
import { DollarSign, CheckCircle2, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Fines | LibSphere',
};

export default async function FinesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const fines = await db.fine.findMany({
    where: { userId },
    include: {
      borrowRecord: {
        include: {
          book: true,
        },
      },
    },
    orderBy: { isPaid: 'asc' },
  });

  const unpaidFines = fines.filter((f) => !f.isPaid);
  const paidFines = fines.filter((f) => f.isPaid);

  const totalUnpaidAmount = unpaidFines.reduce((acc, f) => acc + Number(f.amount), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Library Fines</h1>
        <p className="text-muted-foreground mt-1">Monitor unpaid late fees and pay securely via Razorpay.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl">
            <DollarSign className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Outstanding</span>
            <h3 className="text-2xl font-bold mt-1 text-foreground">₹{totalUnpaidAmount.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl">
            <DollarSign className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Fines</span>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{unpaidFines.length}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Cleared Fines</span>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{paidFines.length}</h3>
          </div>
        </div>
      </div>

      {/* Razorpay Trust Banner */}
      {unpaidFines.length > 0 && (
        <div className="flex items-center gap-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-5 py-3">
          <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Pay securely using <span className="font-semibold text-foreground">Razorpay</span> — 
            supports UPI, Credit/Debit Cards, Net Banking, and Wallets. 
            Your payment is encrypted and 100% secure.
          </p>
        </div>
      )}

      {/* Outstanding Fines Table */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold border-b border-border pb-4 mb-4">Outstanding Fines</h2>
        {unpaidFines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Pay Now</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {unpaidFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-semibold text-foreground">{fine.borrowRecord.book.title}</span>
                        <span className="block text-xs text-muted-foreground">Late return fee</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{format(fine.borrowRecord.dueDate, 'PP')}</td>
                    <td className="py-4 px-4 font-bold text-rose-500">₹{Number(fine.amount).toFixed(2)}</td>
                    <td className="py-4 px-4 text-right">
                      <RazorpayPayButton
                        fineId={fine.id}
                        amount={Number(fine.amount)}
                        userName={session?.user?.name ?? 'Member'}
                        userEmail={session?.user?.email ?? ''}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6 flex flex-col items-center gap-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            You have no outstanding fines! Keep up the good work.
          </p>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold border-b border-border pb-4 mb-4">Payment History</h2>
        {paidFines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Paid Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paidFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-semibold text-foreground">{fine.borrowRecord.book.title}</span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {fine.paidAt ? format(fine.paidAt, 'PP') : 'N/A'}
                    </td>
                    <td className="py-4 px-4 font-semibold text-foreground">₹{Number(fine.amount).toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Paid via Razorpay
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No historical payments found.</p>
        )}
      </div>
    </div>
  );
}
