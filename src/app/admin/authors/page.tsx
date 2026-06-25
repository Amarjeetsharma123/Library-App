import { db } from '@/lib/db';
import AuthorCrudClient from './AuthorCrudClient';

export const metadata = {
  title: 'Manage Authors | LibSphere',
};

export default async function AdminAuthorsPage() {
  const authors = await db.author.findMany({
    include: {
      _count: {
        select: { books: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return <AuthorCrudClient initialAuthors={authors} />;
}
