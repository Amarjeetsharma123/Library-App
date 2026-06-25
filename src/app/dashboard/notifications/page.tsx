import { auth } from '@/auth';
import { db } from '@/lib/db';
import { markNotificationAsRead } from '@/lib/actions/library';
import EmptyState from '@/components/ui/EmptyState';
import { Bell, Check, MailOpen } from 'lucide-react';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'Notifications | LibSphere',
};

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const handleMarkAsRead = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    await markNotificationAsRead(id);
    revalidatePath('/dashboard/notifications');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Due-date reminders, late alerts, and library announcements.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition-colors ${
                  notif.isRead
                    ? 'bg-card border-border/60 opacity-75'
                    : 'bg-primary/5 border-primary/20 shadow-sm'
                }`}
              >
                <div className="space-y-1">
                  <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                    {notif.message}
                  </p>
                  <span className="block text-xs text-muted-foreground font-medium">
                    {format(notif.createdAt, 'PPpp')}
                  </span>
                </div>
                {!notif.isRead && (
                  <form action={handleMarkAsRead}>
                    <input type="hidden" name="id" value={notif.id} />
                    <button
                      type="submit"
                      className="p-2 rounded-lg hover:bg-accent text-primary transition-colors border border-primary/10 hover:border-primary/20 shrink-0"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="All Caught Up"
            description="You have no notifications or messages at this time."
            icon={Bell}
          />
        )}
      </div>
    </div>
  );
}
