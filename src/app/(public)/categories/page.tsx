import { db } from '@/lib/db';
import Link from 'next/link';
import { Tag, BookOpen, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Genres & Categories | LibSphere',
  description: 'Browse our book collections by genres and categories.',
};

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: { books: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Browse Genres & Categories</h1>
        <p className="text-muted-foreground mt-2">Explore our collections categorized by genre.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/books?category=${cat.slug}`}
            className="group flex items-center justify-between p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground rounded-xl transition-colors">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base">
                  {cat.name}
                </h3>
                <span className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  {cat._count.books} {cat._count.books === 1 ? 'book' : 'books'}
                </span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
