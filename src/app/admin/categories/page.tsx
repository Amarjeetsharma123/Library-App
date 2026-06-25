import { db } from '@/lib/db';
import CategoryCrudClient from './CategoryCrudClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manage Genres & Categories | LibSphere',
};

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: { books: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return <CategoryCrudClient initialCategories={categories} />;
}
