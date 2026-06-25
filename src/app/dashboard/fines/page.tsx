import { auth } from '@/auth';
import { db } from '@/lib/db';
import { payFineAction } from '@/lib/actions/library';
import EmptyState from '@/components/ui/EmptyState';
import { DollarSign, CheckCircle2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

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

  const handlePay = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    await payFineAction(id);
    revalidatePath('/dashboard/fines');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Library Fines</h1>
        <p className="text-muted-foreground mt-1">Monitor unpaid late fees and review your transaction history.</p>
      </div>

      {/* Unpaid Fine summary block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4 shadow-sm md:col-span-1">
          <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl">
            <DollarSign className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Outstanding Fines</span>
            <h3 className="text-2xl font-bold mt-1 text-foreground">${totalUnpaidAmount.toFixed(2)}</h3>
          </div>
        </div>
      </div>

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
                  <th className="py-3 px-4 text-right">Actions</th>
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
                    <td className="py-4 px-4 font-bold text-rose-500">${Number(fine.amount).toFixed(2)}</td>
                    <td className="py-4 px-4 text-right">
                      <form action={handlePay}>
                        <input type="hidden" name="id" value={fine.id} />
                        <button
                          type="submit"
                          className="bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-colors"
                        >
                          Pay Now
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">You have no outstanding fines! Keep up the good work.</p>
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
                    <td className="py-4 px-4 font-semibold text-foreground">${Number(fine.amount).toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Paid
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
