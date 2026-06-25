import { db } from '@/lib/db';
import { payFineAction } from '@/lib/actions/library';
import EmptyState from '@/components/ui/EmptyState';
import { DollarSign, Check } from 'lucide-react';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'Manage System Fines | LibSphere',
};

export default async function AdminFinesPage() {
  const fines = await db.fine.findMany({
    include: {
      user: true,
      borrowRecord: {
        include: {
          book: true,
        },
      },
    },
    orderBy: { isPaid: 'asc' },
  });

  const handleManualPayment = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    await payFineAction(id);
    revalidatePath('/admin/fines');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Fines Console</h1>
        <p className="text-muted-foreground mt-1">Monitor outstanding fees, review payment history, and manually clear unpaid records.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {fines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-foreground">{fine.user.name}</td>
                    <td className="py-4 px-4 text-muted-foreground truncate max-w-xs">{fine.borrowRecord.book.title}</td>
                    <td className="py-4 px-4 text-muted-foreground">{format(fine.borrowRecord.dueDate, 'PP')}</td>
                    <td className="py-4 px-4 font-bold text-rose-500">${Number(fine.amount).toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          fine.isPaid
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse'
                        }`}
                      >
                        {fine.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {!fine.isPaid ? (
                        <form action={handleManualPayment}>
                          <input type="hidden" name="id" value={fine.id} />
                          <button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:opacity-90 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-colors"
                          >
                            Confirm Payment
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs text-muted-foreground">Paid on {fine.paidAt ? format(fine.paidAt, 'PP') : 'N/A'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Fines Recorded"
            description="There are no system fines on record."
            icon={DollarSign}
          />
        )}
      </div>
    </div>
  );
}
