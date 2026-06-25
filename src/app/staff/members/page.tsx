import { db } from '@/lib/db';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import { Search, User, ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'Members Management | LibSphere',
};

interface MembersPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const search = params.search || '';

  const queryWhere: any = {
    role: 'MEMBER',
  };

  if (search) {
    queryWhere.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const members = await db.user.findMany({
    where: queryWhere,
    include: {
      borrowRecords: {
        where: { status: { in: ['ISSUED', 'OVERDUE'] } },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Library Members</h1>
        <p className="text-muted-foreground mt-1">Review registrations, checkout counts, and member credentials status.</p>
      </div>

      {/* Search box */}
      <form className="relative flex items-center bg-card border border-border rounded-xl px-4 py-2 shadow-sm max-w-xl">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search members by name or email address..."
          className="w-full bg-transparent px-3 py-1.5 focus:outline-none text-sm text-foreground placeholder-muted-foreground"
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground font-semibold px-4 py-1.5 rounded-lg text-xs"
        >
          Search
        </button>
      </form>

      {/* Members table */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Active Loans</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                          <img
                            src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span>{member.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{member.email}</td>
                    <td className="py-4 px-4 font-semibold">{member.borrowRecords.length} books</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          member.isBlocked
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}
                      >
                        {member.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/staff/members/${member.id}`}
                        className="inline-flex items-center gap-1.5 border border-border text-foreground hover:bg-accent px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Members Found"
            description="No reader profile matches your query filters."
          />
        )}
      </div>
    </div>
  );
}
