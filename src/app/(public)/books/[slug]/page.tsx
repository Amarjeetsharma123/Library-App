import { db } from '@/lib/db';
import { auth } from '@/auth';
import { reserveBookAction } from '@/lib/actions/library';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, Calendar, Tag, ShieldCheck, BookmarkCheck } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

interface BookDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { slug } = await params;
  const session = await auth();
  const isLoggedIn = !!session;
  const user = session?.user;

  // Fetch book
  const book = await db.book.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true,
      reservations: {
        where: {
          userId: user?.id || '',
          status: 'PENDING',
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  const isAvailable = book.availableCopies > 0;
  const hasReserved = book.reservations.length > 0;

  const userId = user?.id;
  const bookId = book.id;

  // Server action handler in the page
  const handleReserve = async () => {
    'use server';
    if (!userId) return;
    await reserveBookAction(userId, bookId);
    revalidatePath(`/books/${slug}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      {/* Back button */}
      <div>
        <Link href="/books" className="text-sm font-semibold text-primary hover:opacity-90">
          &larr; Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Book Cover Image */}
        <div className="md:col-span-4 relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted border border-border shadow-md">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-900 dark:to-slate-850">
              <span className="text-muted-foreground font-semibold">No Cover Image</span>
            </div>
          )}
        </div>

        {/* Book Metadata details */}
        <div className="md:col-span-8 space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Tag className="h-3 w-3" />
              {book.category.name}
            </span>
            <h1 className="text-3xl font-extrabold sm:text-4xl text-foreground">{book.title}</h1>
            <p className="text-lg text-muted-foreground">by <span className="font-semibold text-foreground">{book.author.name}</span></p>
          </div>

          <div className="flex items-center gap-4 text-sm border-y border-border py-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>ISBN: <strong className="text-foreground">{book.isbn}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Published: <strong className="text-foreground">{book.publishedYear || 'N/A'}</strong></span>
            </div>
          </div>

          {/* Copy stock availability */}
          <div className="flex items-center gap-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                isAvailable
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}
            >
              {isAvailable ? 'Available to Borrow' : 'Out of Stock'}
            </span>
            <span className="text-sm text-muted-foreground">
              {book.availableCopies} of {book.totalCopies} copies currently in library shelves.
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg">About this book</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {book.description || 'No description available for this book.'}
            </p>
          </div>

          {/* Call to action buttons */}
          <div className="pt-6 border-t border-border">
            {isLoggedIn ? (
              user?.role === 'MEMBER' ? (
                hasReserved ? (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-550/10 px-4 py-3 rounded-lg border border-emerald-500/20 w-fit">
                    <BookmarkCheck className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-semibold">You have an active reservation for this book.</span>
                  </div>
                ) : (
                  <form action={handleReserve}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg shadow-md shadow-primary/20 hover:opacity-90 transition-all text-sm"
                    >
                      <BookmarkCheck className="h-4 w-4" />
                      Reserve Book
                    </button>
                  </form>
                )
              ) : (
                <div className="text-sm text-muted-foreground">
                  You are logged in as a <strong>{user?.role}</strong>. Reservations are only available for members.
                </div>
              )
            ) : (
              <div className="bg-accent/50 p-6 rounded-xl border border-border space-y-4">
                <p className="text-sm text-muted-foreground">
                  Interested in borrowing or reserving this book? Sign in to your account.
                </p>
                <div className="flex gap-3">
                  <Link
                    href={`/login?callbackUrl=/books/${slug}`}
                    className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm shadow-md"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="border border-border text-foreground hover:bg-accent px-5 py-2.5 rounded-lg text-sm"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Author details card */}
      <div className="bg-card border border-border p-8 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold">About the Author: <span className="text-primary">{book.author.name}</span></h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {book.author.bio || 'No author biography is available.'}
        </p>
      </div>
    </div>
  );
}
