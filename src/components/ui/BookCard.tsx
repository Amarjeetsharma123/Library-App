import Link from 'next/link';
import { Book } from '@prisma/client';

interface BookCardProps {
  book: Book & {
    author: { name: string };
    category: { name: string };
  };
}

export default function BookCard({ book }: BookCardProps) {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200">
      <div className="relative aspect-3/4 overflow-hidden bg-muted">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <span className="text-muted-foreground text-sm font-medium">No Cover Image</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${
              isAvailable
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            }`}
          >
            {isAvailable ? 'Available' : 'Out of Stock'}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
          {book.category.name}
        </span>
        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">by {book.author.name}</p>
        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <span>Published: {book.publishedYear || 'N/A'}</span>
          <span>{book.availableCopies} of {book.totalCopies} copies</span>
        </div>
        <div className="mt-5">
          <Link
            href={`/books/${book.slug}`}
            className="flex w-full items-center justify-center px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
