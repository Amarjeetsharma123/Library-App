'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { BookOpen, Moon, Sun, Menu, X, LogOut, User as UserIcon, LayoutDashboard, Settings } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const user = session?.user as { role?: string; avatar?: string | null; email?: string | null; name?: string | null } | undefined;
  const userRole = user?.role;
  const isLoggedIn = !!session;

  const getDashboardLink = () => {
    if (userRole === 'ADMIN') return '/admin';
    if (userRole === 'LIBRARIAN') return '/staff';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo (Left) */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl">
              <BookOpen className="h-6 w-6 stroke-[2.5]" />
              <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                LibSphere
              </span>
            </Link>
          </div>

          {/* Desktop Navigation (Center) */}
          <div className="hidden md:flex items-center justify-center space-x-6">
            <Link
              href="/books"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                pathname.startsWith('/books') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Browse Books
            </Link>
            <Link
              href="/categories"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                pathname.startsWith('/categories') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Categories
            </Link>
            <Link
              href="/about"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                pathname === '/about' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                pathname === '/contact' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Right Actions & Mobile Toggle (Right) */}
          <div className="flex-1 flex justify-end items-center gap-4">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {mounted && theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Link
                    href={getDashboardLink()}
                    className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-md shadow-primary/20 hover:opacity-90 transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>

                  <div className="relative group">
                    <button className="flex items-center gap-2 p-1 rounded-full border border-border bg-accent/50 hover:bg-accent transition-colors">
                      <img
                        src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                        alt="Avatar"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-border bg-card p-1 shadow-lg ring-1 ring-black/5 hidden group-focus-within:block hover:block">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border mb-1">
                        Signed in as <br />
                        <span className="text-foreground truncate block">{user?.email}</span>
                      </div>
                      <Link
                        href="/dashboard/profile"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        My Profile
                      </Link>
                      {userRole === 'ADMIN' && (
                        <Link
                          href="/admin/settings"
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          Settings
                        </Link>
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 rounded-lg shadow-md shadow-primary/10 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {mounted && theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-md px-4 py-3 space-y-2">
          <Link
            href="/books"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-foreground hover:bg-accent"
          >
            Browse Books
          </Link>
          <Link
            href="/categories"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-foreground hover:bg-accent"
          >
            Categories
          </Link>
          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-foreground hover:bg-accent"
          >
            About
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-foreground hover:bg-accent"
          >
            Contact
          </Link>

          <div className="border-t border-border pt-4 mt-2">
            {isLoggedIn ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Logged in as <strong className="text-foreground">{user?.name}</strong>
                </div>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-2 text-center text-base font-medium"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/20 text-destructive py-2 text-center text-base font-medium hover:bg-destructive/10"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-center text-base font-medium text-foreground hover:bg-accent rounded-lg border border-border"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-center text-base font-medium bg-primary text-primary-foreground hover:opacity-90 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
