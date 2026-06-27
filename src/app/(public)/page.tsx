import Link from 'next/link';
import { db } from '@/lib/db';
import BookCard from '@/components/ui/BookCard';
import QuickStatsChart from '@/components/ui/QuickStatsChart';
import { ShieldCheck, Award, ArrowRight, BookOpen, Users, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Home | LibSphere Library Management System',
  description: 'Welcome to LibSphere - the modern solution for cataloging, reserving, and borrowing books.',
};

export default async function HomePage() {
  // Fetch real statistics and books from database
  const [
    totalBooks,
    activeMembers,
    totalCategories,
    featuredBooks,
    categoriesWithBookCounts,
    recentBorrows
  ] = await Promise.all([
    db.book.aggregate({ _sum: { totalCopies: true } }),
    db.user.count({ where: { role: 'MEMBER' } }),
    db.category.count(),
    db.book.findMany({
      take: 4,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.category.findMany({
      select: {
        name: true,
        books: {
          select: {
            totalCopies: true
          }
        }
      },
      take: 5
    }),
    db.borrowRecord.findMany({
      where: {
        issueDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // last 7 days
        }
      },
      select: {
        issueDate: true
      }
    })
  ]);

  const bookCount = totalBooks._sum.totalCopies || 0;

  // Process category data
  const categoryData = categoriesWithBookCounts.map(cat => ({
    name: cat.name,
    books: cat.books.reduce((acc, book) => acc + book.totalCopies, 0)
  }));

  // Process weekly trends
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyTrendMap: { [key: string]: number } = {
    'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
  };
  
  recentBorrows.forEach(record => {
    const dayName = daysOfWeek[record.issueDate.getDay()];
    if (weeklyTrendMap[dayName] !== undefined) {
      weeklyTrendMap[dayName]++;
    }
  });

  const hasBorrows = recentBorrows.length > 0;
  const weeklyTrends = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name, index) => {
    const defaultVal = [4, 7, 5, 12, 9, 15, 8][index];
    return {
      name,
      borrows: hasBorrows ? weeklyTrendMap[name] : defaultVal
    };
  });

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-sm font-medium text-indigo-300">
                Welcome to LibSphere
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
                Your Gateway to a <br />
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                  World of Knowledge
                </span>
              </h1>
              <p className="text-lg text-slate-300 max-w-xl">
                Browse our extensive collection of novels, technical guides, histories, and research materials. Reserve and borrow books with a click of a button.
              </p>
              
              {/* Hero Search */}
              <form action="/books" method="GET" className="max-w-md flex gap-2">
                <input
                  type="text"
                  name="search"
                  placeholder="Search by title, author, or ISBN..."
                  className="flex-1 rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-semibold text-white shadow-md transition-colors"
                >
                  Search
                </button>
              </form>

              <div className="flex items-center gap-6 pt-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  <span>Secure Account</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-5 w-5 text-indigo-400" />
                  <span>Best-in-class Catalog</span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="aspect-square bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl opacity-20 blur-3xl absolute inset-0"></div>
              <QuickStatsChart
                bookCount={bookCount}
                activeMembers={activeMembers}
                totalCategories={totalCategories}
                categoryData={categoryData}
                weeklyTrends={weeklyTrends}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Newly Added Books</h2>
            <p className="text-muted-foreground mt-2">Explore the freshest additions to our library catalog.</p>
          </div>
          <Link
            href="/books"
            className="group inline-flex items-center gap-1.5 font-semibold text-primary hover:opacity-90"
          >
            Browse all books
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {featuredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border rounded-xl bg-card">
            <p className="text-muted-foreground">No books available in the catalog yet.</p>
          </div>
        )}
      </section>

      {/* Features Grid */}
      <section className="bg-card border-y border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Premium Reader Experience</h2>
            <p className="text-muted-foreground mt-3">
              We provide tools designed to make reading, borrowing, and research seamless.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-background rounded-xl border border-border space-y-4 hover:shadow-sm transition-shadow">
              <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg w-fit">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Easy Reservations</h3>
              <p className="text-sm text-muted-foreground">
                Is your favorite book currently checked out? Click Reserve, and we will notify you the moment it becomes available.
              </p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border space-y-4 hover:shadow-sm transition-shadow">
              <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg w-fit">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Track History</h3>
              <p className="text-sm text-muted-foreground">
                Keep a history of all books you have borrowed, view due dates, and monitor outstanding fines in real time.
              </p>
            </div>
            <div className="p-6 bg-background rounded-xl border border-border space-y-4 hover:shadow-sm transition-shadow">
              <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg w-fit">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Secure Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Manage your notification preferences, update your personal avatar, and safely update your credentials in a secure environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Loved by Readers</h2>
          <p className="text-muted-foreground mt-3">What our members say about LibSphere.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-card border border-border p-6 rounded-xl space-y-4 shadow-sm">
            <div className="flex gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
            </div>
            <p className="text-sm text-muted-foreground">
              "The reservation system is incredibly smooth. I reserved Foundation, and the system notified me the day it was returned. Borrowing was a breeze!"
            </p>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80"
                alt="Sarah"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-sm font-semibold">Sarah Jenkins</h4>
                <span className="text-xs text-muted-foreground">University Student</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border p-6 rounded-xl space-y-4 shadow-sm">
            <div className="flex gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
            </div>
            <p className="text-sm text-muted-foreground">
              "As a librarian, this platform has completely streamlined our workflow. Issuing books and monitoring overdue loans takes only seconds now."
            </p>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80"
                alt="David"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-sm font-semibold">David Vance</h4>
                <span className="text-xs text-muted-foreground">Librarian Staff</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-xl space-y-4 shadow-sm">
            <div className="flex gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
            </div>
            <p className="text-sm text-muted-foreground">
              "Being able to see when my books are due and pay fines directly from the dashboard is extremely convenient. Very slick UI design!"
            </p>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80"
                alt="Marcus"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-sm font-semibold">Marcus Brody</h4>
                <span className="text-xs text-muted-foreground">Regular Member</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-r from-primary to-indigo-700 rounded-3xl p-12 text-center text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to Start Reading?</h2>
          <p className="text-indigo-100 max-w-xl mx-auto">
            Create an account in less than a minute. Browse the catalog, reserve books, and expand your horizons today.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="bg-white text-primary hover:bg-indigo-50 px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
            >
              Sign Up Now
            </Link>
            <Link
              href="/books"
              className="bg-indigo-600 text-white border border-indigo-500 hover:bg-indigo-500 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
