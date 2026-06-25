import { db } from '@/lib/db';
import BookCard from '@/components/ui/BookCard';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  return {
    title: category ? `${category.name} Books | LibSphere` : 'Category Not Found',
  };
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      books: {
        include: {
          author: { select: { name: true } },
          category: { select: { name: true } },
        },
        orderBy: { title: 'asc' },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link href="/categories" className="text-sm font-semibold text-primary hover:opacity-90">
          &larr; All Categories
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Tag className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{category.name} Books</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse all books cataloged under {category.name}.
          </p>
        </div>
      </div>

      {/* Books grid */}
      {category.books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {category.books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Books in Category"
          description={`There are currently no books cataloged under the ${category.name} genre.`}
        />
      )}
    </div>
  );
}
