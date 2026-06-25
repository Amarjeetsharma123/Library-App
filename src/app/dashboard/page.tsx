import { auth } from '@/auth';
import { db } from '@/lib/db';
import { updateOverdueLoans } from '@/lib/actions/library';
import StatCard from '@/components/ui/StatCard';
import BookCard from '@/components/ui/BookCard';
import Link from 'next/link';
import { BookOpen, Calendar, AlertCircle, DollarSign, BookmarkCheck, Inbox } from 'lucide-react';
import { format } from 'date-fns';

export const metadata = {
  title: 'Dashboard Overview | LibSphere',
};

export default async function MemberDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-semibold">User session not found. Please log in.</p>
      </div>
    );
  }

  // Update overdue records on-the-fly for accurate calculations
  await updateOverdueLoans();

  // Fetch Member Details
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      borrowRecords: {
        where: { status: { in: ['ISSUED', 'OVERDUE'] } },
        include: { book: { include: { author: true, category: true } } },
      },
      reservations: {
        where: { status: 'PENDING' },
        include: { book: { include: { author: true, category: true } } },
      },
      fines: {
        where: { isPaid: false },
      },
      notifications: {
        take: 3,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    return <div className="p-6 text-center">User not found.</div>;
  }

  // Calculate totals
  const totalBorrowedCount = user.borrowRecords.length;
  const activeReservationsCount = user.reservations.length;
  const totalFinesAmount = user.fines.reduce((acc, fine) => acc + Number(fine.amount), 0);

  // Overdue count
  const overdueCount = user.borrowRecords.filter((rec) => rec.status === 'OVERDUE').length;

  // Recommended Books (random 3 books not currently borrowed)
  const borrowedBookIds = user.borrowRecords.map((r) => r.bookId);
  const recommendedBooks = await db.book.findMany({
    where: {
      id: { notIn: borrowedBookIds },
    },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mt-1">Here is a quick summary of your library activity.</p>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Last checked: {format(new Date(), 'PPpp')}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Books Borrowed"
          value={totalBorrowedCount}
          description="Currently checked out"
          icon={BookOpen}
          color="text-indigo-600 bg-indigo-500/10"
        />
        <StatCard
          title="Overdue Books"
          value={overdueCount}
          description="Require immediate return"
          icon={AlertCircle}
          color={overdueCount > 0 ? 'text-rose-600 bg-rose-500/10' : 'text-slate-600 bg-slate-500/10'}
        />
        <StatCard
          title="Active Reservations"
          value={activeReservationsCount}
          description="Pending book copies"
          icon={BookmarkCheck}
          color="text-amber-600 bg-amber-500/10"
        />
        <StatCard
          title="Outstanding Fines"
          value={`$${totalFinesAmount.toFixed(2)}`}
          description="Unpaid late fees"
          icon={DollarSign}
          color={totalFinesAmount > 0 ? 'text-amber-600 bg-amber-500/10' : 'text-slate-600 bg-slate-500/10'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Currently Borrowed books */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="font-bold text-lg">Currently Borrowed Books</h2>
              <Link href="/dashboard/my-books" className="text-xs font-semibold text-primary hover:opacity-90">
                View History
              </Link>
            </div>

            {user.borrowRecords.length > 0 ? (
              <div className="divide-y divide-border">
                {user.borrowRecords.map((record) => {
                  const isOverdue = record.status === 'OVERDUE';
                  return (
                    <div key={record.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-12 rounded bg-muted overflow-hidden border border-border shrink-0">
                          {record.book.coverImage ? (
                            <img src={record.book.coverImage} alt={record.book.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground font-semibold">No Cover</div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm line-clamp-1">{record.book.title}</h4>
                          <p className="text-xs text-muted-foreground">by {record.book.author.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Due: <strong className={isOverdue ? 'text-rose-600 font-bold' : 'text-foreground'}>{format(record.dueDate, 'PP')}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isOverdue
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse'
                              : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                          }`}
                        >
                          {isOverdue ? 'Overdue' : 'Active'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Inbox className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground mt-2">You aren't currently borrowing any books.</p>
                <Link href="/books" className="inline-block mt-4 text-xs font-semibold text-primary hover:opacity-90">
                  Search the catalog &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Recommended Books grid */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg">Recommended Books For You</h2>
            {recommendedBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {recommendedBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recommendations at this time.</p>
            )}
          </div>
        </div>

        {/* Right Column: Notifications & Active Reservations */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notifications */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
              <h2 className="font-bold text-base">Recent Notifications</h2>
              <Link href="/dashboard/notifications" className="text-xs font-semibold text-primary hover:opacity-90">
                View All
              </Link>
            </div>
            {user.notifications.length > 0 ? (
              <div className="space-y-4">
                {user.notifications.map((notif) => (
                  <div key={notif.id} className="text-xs space-y-1 p-3 bg-accent/40 rounded-lg border border-border">
                    <p className="text-foreground leading-relaxed">{notif.message}</p>
                    <span className="block text-[10px] text-muted-foreground font-medium">
                      {format(notif.createdAt, 'PP')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No notifications found.</p>
            )}
          </div>

          {/* Pending Reservations */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
              <h2 className="font-bold text-base">My Reservations</h2>
              <Link href="/dashboard/reservations" className="text-xs font-semibold text-primary hover:opacity-90">
                Manage
              </Link>
            </div>
            {user.reservations.length > 0 ? (
              <div className="space-y-3">
                {user.reservations.slice(0, 3).map((res) => (
                  <div key={res.id} className="flex justify-between items-center gap-2 text-xs border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                    <div className="truncate">
                      <h4 className="font-semibold text-foreground truncate">{res.book.title}</h4>
                      <p className="text-muted-foreground truncate">by {res.book.author.name}</p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No active reservations.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
