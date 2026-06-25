import { db } from '@/lib/db';
import { returnBookAction } from '@/lib/actions/library';
import EmptyState from '@/components/ui/EmptyState';
import { Search, Undo2, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'Process Return Book | LibSphere',
};

interface ReturnBookPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function ReturnBookPage({ searchParams }: ReturnBookPageProps) {
  const params = await searchParams;
  const search = params.search || '';

  // Query issued and overdue records
  const queryWhere: any = {
    status: { in: ['ISSUED', 'OVERDUE'] },
  };

  if (search) {
    queryWhere.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { book: { title: { contains: search, mode: 'insensitive' } } },
      { book: { isbn: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const activeLoans = await db.borrowRecord.findMany({
    where: queryWhere,
    include: {
      book: { select: { title: true, isbn: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  const handleReturn = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    await returnBookAction(id);
    revalidatePath('/staff/return-book');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Process Returns</h1>
        <p className="text-muted-foreground mt-1">Accept returned books and calculate any late return fines dynamically.</p>
      </div>

      {/* Search active loans */}
      <form className="relative flex items-center bg-card border border-border rounded-xl px-4 py-2 shadow-sm max-w-xl">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by member name, email, book title or ISBN..."
          className="w-full bg-transparent px-3 py-1.5 focus:outline-none text-sm text-foreground placeholder-muted-foreground"
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground font-semibold px-4 py-1.5 rounded-lg text-xs"
        >
          Search
        </button>
      </form>

      {/* Table grid */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {activeLoans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Borrowed By</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeLoans.map((loan) => {
                  const isOverdue = loan.status === 'OVERDUE';
                  return (
                    <tr key={loan.id} className="hover:bg-accent/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-foreground">
                        <div>
                          <span>{loan.book.title}</span>
                          <span className="block text-xs font-normal text-muted-foreground">ISBN: {loan.book.isbn}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        <div>
                          <span>{loan.user.name}</span>
                          <span className="block text-xs font-normal text-muted-foreground">{loan.user.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{format(loan.dueDate, 'PP')}</td>
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
                      <td className="py-4 px-4 text-right">
                        <form action={handleReturn}>
                          <input type="hidden" name="id" value={loan.id} />
                          <button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-colors"
                          >
                            Mark Returned
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Active Loans Found"
            description="There are no active loans matching your search filters."
          />
        )}
      </div>
    </div>
  );
}
