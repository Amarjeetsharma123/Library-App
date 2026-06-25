import { db } from '@/lib/db';
import { toggleBlockUserAction } from '@/lib/actions/library';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import { Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'Admin Members Console | LibSphere',
};

interface AdminMembersPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function AdminMembersPage({ searchParams }: AdminMembersPageProps) {
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

  const handleToggleBlock = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    await toggleBlockUserAction(id);
    revalidatePath('/admin/members');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Manage Members</h1>
        <p className="text-muted-foreground mt-1">Review member registrations, checkout activity, and block/unblock accounts.</p>
      </div>

      {/* Search box */}
      <form className="relative flex items-center bg-card border border-border rounded-xl px-4 py-2 shadow-sm max-w-xl">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by reader name or email address..."
          className="w-full bg-transparent px-3 py-1.5 focus:outline-none text-sm text-foreground placeholder-muted-foreground"
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground font-semibold px-4 py-1.5 rounded-lg text-xs"
        >
          Search
        </button>
      </form>

      {/* Members List table */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email Address</th>
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
                    <td className="py-4 px-4 text-right flex justify-end gap-2">
                      <Link
                        href={`/staff/members/${member.id}`}
                        className="inline-flex items-center gap-1.5 border border-border text-foreground hover:bg-accent px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        View Details
                      </Link>
                      <form action={handleToggleBlock}>
                        <input type="hidden" name="id" value={member.id} />
                        <button
                          type="submit"
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            member.isBlocked
                              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                              : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
                          }`}
                        >
                          {member.isBlocked ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                          {member.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Members Registered"
            description="There are no members matching your query."
          />
        )}
      </div>
    </div>
  );
}
