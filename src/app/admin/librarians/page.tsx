import { db } from '@/lib/db';
import { updateUserRoleAction } from '@/lib/actions/library';
import EmptyState from '@/components/ui/EmptyState';
import { UserCheck, ShieldAlert, Trash2, Mail, Search } from 'lucide-react';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'Staff Management | LibSphere',
};

export default async function AdminLibrariansPage() {
  // Query all staff (LIBRARIAN and ADMIN)
  const staff = await db.user.findMany({
    where: {
      role: { in: ['LIBRARIAN', 'ADMIN'] },
    },
    orderBy: { role: 'asc' },
  });

  const handlePromote = async (formData: FormData) => {
    'use server';
    const email = formData.get('email') as string;
    if (!email) return;

    // Find member by email
    const member = await db.user.findUnique({
      where: { email },
    });

    if (!member) return;

    await updateUserRoleAction(member.id, 'LIBRARIAN');
    revalidatePath('/admin/librarians');
  };

  const handleDemote = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    await updateUserRoleAction(id, 'MEMBER');
    revalidatePath('/admin/librarians');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Staff Management</h1>
        <p className="text-muted-foreground mt-1">Promote members to Librarian status or demote staff back to normal reader accounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Promote member form */}
        <div className="lg:col-span-5 bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold border-b border-border pb-3 mb-4">Promote to Librarian</h3>
          <form action={handlePromote} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold">User Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="user@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg text-sm shadow-md hover:opacity-90 transition-all"
            >
              <UserCheck className="h-4 w-4" />
              Promote Member
            </button>
          </form>
        </div>

        {/* Right Side: Staff list */}
        <div className="lg:col-span-7 bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold border-b border-border pb-3 mb-4">Active Staff Members</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-2.5 px-2">Name</th>
                  <th className="py-2.5 px-2">Role</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-2 font-semibold text-foreground">
                      <div>
                        <span>{member.name}</span>
                        <span className="block text-xs font-normal text-muted-foreground">{member.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          member.role === 'ADMIN'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {member.role !== 'ADMIN' ? (
                        <form action={handleDemote}>
                          <input type="hidden" name="id" value={member.id} />
                          <button
                            type="submit"
                            className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Demote to Member
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs text-muted-foreground">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
