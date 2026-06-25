import { db } from '@/lib/db';
import EmptyState from '@/components/ui/EmptyState';
import { Search, Calendar, History } from 'lucide-react';
import { format } from 'date-fns';

export const metadata = {
  title: 'All Transactions | LibSphere',
};

interface TransactionsPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function AdminTransactionsPage({ searchParams }: TransactionsPageProps) {
  const params = await searchParams;
  const search = params.search || '';

  const queryWhere: any = {};

  if (search) {
    queryWhere.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { book: { title: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const transactions = await db.borrowRecord.findMany({
    where: queryWhere,
    include: {
      book: true,
      user: true,
    },
    orderBy: { issueDate: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Transactions</h1>
        <p className="text-muted-foreground mt-1">Review library lend-and-return history logs across all readers.</p>
      </div>

      {/* Search box */}
      <form className="relative flex items-center bg-card border border-border rounded-xl px-4 py-2 shadow-sm max-w-xl">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search transactions by member or book title..."
          className="w-full bg-transparent px-3 py-1.5 focus:outline-none text-sm text-foreground placeholder-muted-foreground"
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground font-semibold px-4 py-1.5 rounded-lg text-xs"
        >
          Search
        </button>
      </form>

      {/* Transactions list table */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Borrowed By</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((rec) => {
                  const isOverdue = rec.status === 'OVERDUE';
                  return (
                    <tr key={rec.id} className="hover:bg-accent/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-foreground truncate max-w-xs">{rec.book.title}</td>
                      <td className="py-4 px-4 text-muted-foreground truncate max-w-xs">{rec.user.name}</td>
                      <td className="py-4 px-4 text-muted-foreground">{format(rec.issueDate, 'PP')}</td>
                      <td className="py-4 px-4 text-muted-foreground">{format(rec.dueDate, 'PP')}</td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {rec.returnDate ? format(rec.returnDate, 'PP') : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            rec.returnDate
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : isOverdue
                              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                              : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                          }`}
                        >
                          {rec.returnDate ? 'Returned' : isOverdue ? 'Overdue' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold">
                        {Number(rec.fineAmount) > 0 ? (
                          <span className="text-rose-500">${Number(rec.fineAmount).toFixed(2)}</span>
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
          <EmptyState
            title="No Transactions Found"
            description="There are no transaction records corresponding to your query."
            icon={History}
          />
        )}
      </div>
    </div>
  );
}
