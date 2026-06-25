'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Book,
  Tags,
  Users,
  ShieldAlert,
  History,
  FileText,
  Settings,
  BookOpen,
  PlusCircle,
  Undo2,
  DollarSign,
  User,
  Bell,
  Sliders,
} from 'lucide-react';

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role;

  if (!role) return null;

  // Define links based on roles
  const adminLinks = [
    { href: '/admin', label: 'Analytics', icon: LayoutDashboard },
    { href: '/admin/books', label: 'Manage Books', icon: Book },
    { href: '/admin/categories', label: 'Categories', icon: Tags },
    { href: '/admin/authors', label: 'Authors', icon: User },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/librarians', label: 'Librarians', icon: ShieldAlert },
    { href: '/admin/transactions', label: 'Transactions', icon: History },
    { href: '/admin/fines', label: 'Fine Rules', icon: DollarSign },
    { href: '/admin/settings', label: 'Library Settings', icon: Settings },
  ];

  const librarianLinks = [
    { href: '/staff', label: 'Staff Overview', icon: LayoutDashboard },
    { href: '/staff/issue-book', label: 'Issue Book', icon: PlusCircle },
    { href: '/staff/return-book', label: 'Return Book', icon: Undo2 },
    { href: '/staff/members', label: 'View Members', icon: Users },
  ];

  const memberLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/my-books', label: 'Borrowed Books', icon: BookOpen },
    { href: '/dashboard/reservations', label: 'Reservations', icon: Tags },
    { href: '/dashboard/fines', label: 'My Fines', icon: DollarSign },
    { href: '/dashboard/profile', label: 'My Profile', icon: User },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { href: '/dashboard/settings', label: 'Preferences', icon: Sliders },
  ];

  let links = memberLinks;
  let title = 'Member Area';

  if (pathname.startsWith('/admin') && role === 'ADMIN') {
    links = adminLinks;
    title = 'Admin Console';
  } else if (pathname.startsWith('/staff') && (role === 'LIBRARIAN' || role === 'ADMIN')) {
    links = librarianLinks;
    title = 'Staff Portal';
  }

  return (
    <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-6 border-b border-border">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && link.href !== '/staff' && link.href !== '/dashboard' && pathname.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
