'use client';

import React, { useState, useTransition } from 'react';
import { createCategoryAction } from '@/lib/actions/library';
import { toast } from 'sonner';
import { Plus, Tag, Trash2 } from 'lucide-react';

interface CategoryCrudClientProps {
  initialCategories: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    _count: { books: number };
  }>;
}

export default function CategoryCrudClient({ initialCategories }: CategoryCrudClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      const res = await createCategoryAction(name, description || null);
      if (res.success && res.category) {
        toast.success(res.message);
        setCategories((prev) => [
          {
            ...(res.category as any),
            _count: { books: 0 },
          },
          ...prev,
        ]);
        setName('');
        setDescription('');
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Manage Genres & Categories</h1>
        <p className="text-muted-foreground mt-1">Configure the classification categories used in catalog browsing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Create form */}
        <div className="lg:col-span-5 bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold border-b border-border pb-3 mb-4">Add New Genre</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="cat-name" className="text-sm font-semibold">Category Name</label>
              <input
                id="cat-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Science Fiction, Biography"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cat-desc" className="text-sm font-semibold">Description</label>
              <textarea
                id="cat-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the category..."
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </form>
        </div>

        {/* Right Side: List categories */}
        <div className="lg:col-span-7 bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold border-b border-border pb-3 mb-4">Existing Categories</h3>
          {categories.length > 0 ? (
            <div className="divide-y divide-border">
              {categories.map((cat) => (
                <div key={cat.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-sm text-foreground truncate">{cat.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{cat.description || 'No description provided.'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      {cat._count.books} books
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No categories found in system.</p>
          )}
        </div>
      </div>
    </div>
  );
}
