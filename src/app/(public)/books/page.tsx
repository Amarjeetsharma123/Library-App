import { db } from '@/lib/db';
import BookCard from '@/components/ui/BookCard';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import { Search, Filter, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Books Catalog | LibSphere',
  description: 'Search, filter, and discover books from our public catalog.',
};

interface BooksPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    author?: string;
    available?: string;
    page?: string;
  }>;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams;
  const search = params.search || '';
  const categorySlug = params.category || '';
  const authorId = params.author || '';
  const isAvailableOnly = params.available === 'true';
  const currentPage = parseInt(params.page || '1', 10);
  const itemsPerPage = 8;

  // Fetch authors & categories for filters
  const [categories, authors] = await Promise.all([
    db.category.findMany({ orderBy: { name: 'asc' } }),
    db.author.findMany({ orderBy: { name: 'asc' } }),
  ]);

  // Construct search query
  const queryWhere: any = {};

  if (search) {
    queryWhere.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { isbn: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categorySlug) {
    queryWhere.category = { slug: categorySlug };
  }

  if (authorId) {
    queryWhere.authorId = authorId;
  }

  if (isAvailableOnly) {
    queryWhere.availableCopies = { gt: 0 };
  }

  // Count total items
  const totalItems = await db.book.count({ where: queryWhere });
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Fetch books
  const books = await db.book.findMany({
    where: queryWhere,
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { title: 'asc' },
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
  });

  const getQueryString = (updatedParams: Record<string, string | null>) => {
    const combinedParams = {
      search: search || null,
      category: categorySlug || null,
      author: authorId || null,
      available: isAvailableOnly ? 'true' : null,
      page: currentPage.toString(),
      ...updatedParams,
    };

    const searchParts = [];
    for (const [key, val] of Object.entries(combinedParams)) {
      if (val !== null && val !== '') {
        searchParts.push(`${key}=${encodeURIComponent(val)}`);
      }
    }
    return searchParts.length > 0 ? `?${searchParts.join('&')}` : '';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Browse Book Catalog</h1>
        <p className="text-muted-foreground mt-2">Discover and search our collection of books.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filters Panel */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-card border border-border p-6 rounded-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Filter className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm uppercase tracking-wider">Filters</h2>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Availability</span>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/books${getQueryString({ available: isAvailableOnly ? null : 'true', page: '1' })}`}
                  className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg border transition-colors ${
                    isAvailableOnly
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'border-border text-foreground hover:bg-accent'
                  }`}
                >
                  <span>Available Only</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {await db.book.count({ where: { ...queryWhere, availableCopies: { gt: 0 } } })}
                  </span>
                </Link>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2 border-t border-border pt-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Genre / Category</span>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                <Link
                  href={`/books${getQueryString({ category: null, page: '1' })}`}
                  className={`block shrink-0 text-sm px-3 py-2 rounded-lg transition-colors ${
                    !categorySlug ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  All Genres
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/books${getQueryString({ category: cat.slug, page: '1' })}`}
                    className={`block shrink-0 text-sm px-3 py-2 rounded-lg truncate transition-colors ${
                      categorySlug === cat.slug ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Authors */}
            <div className="space-y-2 border-t border-border pt-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Author</span>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                <Link
                  href={`/books${getQueryString({ author: null, page: '1' })}`}
                  className={`block shrink-0 text-sm px-3 py-2 rounded-lg transition-colors ${
                    !authorId ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  All Authors
                </Link>
                {authors.map((auth) => (
                  <Link
                    key={auth.id}
                    href={`/books${getQueryString({ author: auth.id, page: '1' })}`}
                    className={`block shrink-0 text-sm px-3 py-2 rounded-lg truncate transition-colors ${
                      authorId === auth.id ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {auth.name}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Reset all filters */}
            {(search || categorySlug || authorId || isAvailableOnly) && (
              <Link
                href="/books"
                className="block text-center text-xs font-semibold text-primary hover:opacity-90 pt-2 border-t border-border"
              >
                Clear All Filters
              </Link>
            )}
          </div>
        </aside>

        {/* Catalog Panel */}
        <main className="lg:col-span-9 space-y-6">
          {/* Search bar */}
          <form className="relative flex items-center bg-card border border-border rounded-xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search catalog by book title, author name, description or ISBN..."
              className="w-full bg-transparent px-3 py-1.5 focus:outline-none text-sm text-foreground placeholder-muted-foreground"
            />
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {authorId && <input type="hidden" name="author" value={authorId} />}
            {isAvailableOnly && <input type="hidden" name="available" value="true" />}
            <button
              type="submit"
              className="bg-primary text-primary-foreground font-semibold px-4 py-1.5 rounded-lg text-xs"
            >
              Search
            </button>
          </form>

          {/* Results grid */}
          {books.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-8">
                  <Link
                    href={`/books${getQueryString({ page: Math.max(1, currentPage - 1).toString() })}`}
                    className={`px-4 py-2 border border-border text-sm rounded-lg hover:bg-accent transition-colors ${
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    Previous
                  </Link>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Link
                    href={`/books${getQueryString({ page: Math.min(totalPages, currentPage + 1).toString() })}`}
                    className={`px-4 py-2 border border-border text-sm rounded-lg hover:bg-accent transition-colors ${
                      currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    Next
                  </Link>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No Books Found"
              description="No books match your search queries. Try clearing some filters or using different terms."
              icon={BookOpen}
            />
          )}
        </main>
      </div>
    </div>
  );
}
