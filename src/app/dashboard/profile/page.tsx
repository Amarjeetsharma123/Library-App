import { auth } from '@/auth';
import { db } from '@/lib/db';
import ProfileClient from './ProfileClient';

export const metadata = {
  title: 'My Profile | LibSphere',
};

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  });

  if (!user) return <div className="p-6 text-center">User details not found.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account information and preferences.</p>
      </div>

      <ProfileClient initialUser={user} />
    </div>
  );
}
