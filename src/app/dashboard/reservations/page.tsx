import { auth } from '@/auth';
import { db } from '@/lib/db';
import { cancelReservationAction } from '@/lib/actions/library';
import EmptyState from '@/components/ui/EmptyState';
import { Tags, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'My Reservations | LibSphere',
};

export default async function ReservationsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const reservations = await db.reservation.findMany({
    where: { userId },
    include: {
      book: {
        include: { author: true },
      },
    },
    orderBy: { reservedAt: 'desc' },
  });

  const activeReservations = reservations.filter((r) => r.status === 'PENDING');
  const pastReservations = reservations.filter((r) => r.status !== 'PENDING');

  const handleCancel = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    await cancelReservationAction(id);
    revalidatePath('/dashboard/reservations');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Manage My Reservations</h1>
        <p className="text-muted-foreground mt-1">Review active book reservations or cancel requests.</p>
      </div>

      {/* Active Reservations */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold border-b border-border pb-4 mb-4">Active Reservations</h2>
        {activeReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Book Details</th>
                  <th className="py-3 px-4">Reserved Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-semibold text-foreground">{res.book.title}</span>
                        <span className="block text-xs text-muted-foreground">by {res.book.author.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{format(res.reservedAt, 'PP')}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                        Pending
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <form action={handleCancel}>
                        <input type="hidden" name="id" value={res.id} />
                        <button
                          type="submit"
                          className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Cancel Reservation
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">You have no active reservations.</p>
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold border-b border-border pb-4 mb-4">Reservation History</h2>
        {pastReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Book Details</th>
                  <th className="py-3 px-4">Reserved Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pastReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-semibold text-foreground">{res.book.title}</span>
                        <span className="block text-xs text-muted-foreground">by {res.book.author.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{format(res.reservedAt, 'PP')}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          res.status === 'FULFILLED'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No historical reservations found.</p>
        )}
      </div>
    </div>
  );
}
