import { db } from '@/lib/db';
import BookCrudClient from './BookCrudClient';

export const metadata = {
  title: 'Manage Catalog Books | LibSphere',
};

export default async function AdminBooksPage() {
  const [books, authors, categories] = await Promise.all([
    db.book.findMany({
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { title: 'asc' },
    }),
    db.author.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <BookCrudClient
      initialBooks={books}
      authors={authors}
      categories={categories}
    />
  );
}
