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
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <span className="text-muted-foreground text-[10px] sm:text-sm font-medium">No Cover</span>
          </div>
        )}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] sm:text-xs font-semibold shadow-sm ${
              isAvailable
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            }`}
          >
            {isAvailable ? 'Available' : 'Out of Stock'}
          </span>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <span className="text-[9px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-0.5 sm:mb-1">
          {book.category.name}
        </span>
        
        {/* Title & Author with fixed height boundaries to keep cards aligned */}
        <div className="flex-1 min-h-[55px] sm:min-h-[65px] flex flex-col justify-start">
          <h3 className="text-xs sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {book.title}
          </h3>
          <p className="mt-0.5 text-[10px] sm:text-sm text-muted-foreground line-clamp-1">
            by {book.author.name}
          </p>
        </div>

        {/* Dynamic metadata block - clean design */}
        <div className="mt-2.5 pt-2.5 border-t border-border flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:items-center text-[10px] sm:text-xs text-muted-foreground">
          <span>Year: {book.publishedYear || 'N/A'}</span>
          <span className="font-medium text-foreground">
            {book.availableCopies}/{book.totalCopies} left
          </span>
        </div>

        <div className="mt-3">
          <Link
            href={`/books/${book.slug}`}
            className="flex w-full items-center justify-center py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-sm hover:shadow transition-all duration-150"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
