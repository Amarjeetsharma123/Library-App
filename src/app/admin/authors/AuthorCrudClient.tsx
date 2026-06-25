'use client';

import React, { useState, useTransition } from 'react';
import { createAuthorAction } from '@/lib/actions/library';
import { toast } from 'sonner';
import { Plus, User } from 'lucide-react';

interface AuthorCrudClientProps {
  initialAuthors: Array<{
    id: string;
    name: string;
    bio: string | null;
    _count: { books: number };
  }>;
}

export default function AuthorCrudClient({ initialAuthors }: AuthorCrudClientProps) {
  const [authors, setAuthors] = useState(initialAuthors);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      const res = await createAuthorAction(name, bio || null);
      if (res.success && res.author) {
        toast.success(res.message);
        setAuthors((prev) => [
          {
            ...(res.author as any),
            _count: { books: 0 },
          },
          ...prev,
        ]);
        setName('');
        setBio('');
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Manage Authors</h1>
        <p className="text-muted-foreground mt-1">Configure author profiles to assign to catalogs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Create form */}
        <div className="lg:col-span-5 bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold border-b border-border pb-3 mb-4">Add New Author</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="auth-name" className="text-sm font-semibold">Author Name</label>
              <input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Isaac Asimov, J.K. Rowling"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="auth-bio" className="text-sm font-semibold">Biography</label>
              <textarea
                id="auth-bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief writer biography summary..."
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Author
            </button>
          </form>
        </div>

        {/* Right Side: List authors */}
        <div className="lg:col-span-7 bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold border-b border-border pb-3 mb-4">Existing Authors</h3>
          {authors.length > 0 ? (
            <div className="divide-y divide-border">
              {authors.map((auth) => (
                <div key={auth.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-sm text-foreground truncate">{auth.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{auth.bio || 'No author biography provided.'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      {auth._count.books} books
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No authors found in database.</p>
          )}
        </div>
      </div>
    </div>
  );
}
