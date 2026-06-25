'use client';

import React, { useState, useTransition } from 'react';
import { createBookAction, updateBookAction, deleteBookAction } from '@/lib/actions/library';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, X, BookOpen } from 'lucide-react';

interface BookCrudClientProps {
  initialBooks: Array<{
    id: string;
    title: string;
    slug: string;
    isbn: string;
    coverImage: string | null;
    publishedYear: number | null;
    totalCopies: number;
    availableCopies: number;
    author: { id: string; name: string };
    category: { id: string; name: string };
    description: string | null;
  }>;
  authors: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}

export default function BookCrudClient({ initialBooks, authors, categories }: BookCrudClientProps) {
  const [books, setBooks] = useState(initialBooks);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [publishedYear, setPublishedYear] = useState(new Date().getFullYear());
  const [totalCopies, setTotalCopies] = useState(1);
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');

  const openAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setIsbn('');
    setAuthorId(authors[0]?.id || '');
    setCategoryId(categories[0]?.id || '');
    setPublishedYear(new Date().getFullYear());
    setTotalCopies(5);
    setCoverImage('');
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (book: any) => {
    setEditingBook(book);
    setTitle(book.title);
    setIsbn(book.isbn);
    setAuthorId(book.author.id);
    setCategoryId(book.category.id);
    setPublishedYear(book.publishedYear || new Date().getFullYear());
    setTotalCopies(book.totalCopies);
    setCoverImage(book.coverImage || '');
    setDescription(book.description || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bookData = {
      title,
      isbn,
      authorId,
      categoryId,
      publishedYear: Number(publishedYear),
      totalCopies: Number(totalCopies),
      coverImage: coverImage || undefined,
      description: description || undefined,
    };

    startTransition(async () => {
      if (editingBook) {
        // Edit Mode
        const res = await updateBookAction(editingBook.id, bookData);
        if (res.success && res.book) {
          toast.success('Book updated successfully!');
          setBooks((prev) =>
            prev.map((b) => (b.id === editingBook.id ? { ...b, ...res.book } : b))
          );
          setShowModal(false);
        } else {
          toast.error(res.message);
        }
      } else {
        // Add Mode
        const res = await createBookAction(bookData);
        if (res.success && res.book) {
          toast.success('Book created successfully!');
          setBooks((prev) => [res.book as any, ...prev]);
          setShowModal(false);
        } else {
          toast.error(res.message);
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    startTransition(async () => {
      const res = await deleteBookAction(id);
      if (res.success) {
        toast.success(res.message);
        setBooks((prev) => prev.filter((b) => b.id !== id));
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header action button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Catalog Books</h1>
          <p className="text-muted-foreground mt-1">Add, update, or remove books from the system database.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-lg text-sm shadow-md hover:opacity-90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add New Book
        </button>
      </div>

      {/* Book table */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        {books.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Cover</th>
                  <th className="py-3 px-4">Book Details</th>
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4">Genre</th>
                  <th className="py-3 px-4">Copies</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="h-12 w-9 rounded bg-muted overflow-hidden border border-border shrink-0">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[8px] text-muted-foreground font-semibold">No Image</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-foreground">
                      <div>
                        <span>{book.title}</span>
                        <span className="block text-xs font-normal text-muted-foreground">by {book.author.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{book.isbn}</td>
                    <td className="py-4 px-4 text-muted-foreground">{book.category.name}</td>
                    <td className="py-4 px-4 font-medium text-foreground">
                      {book.availableCopies} of {book.totalCopies}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(book)}
                        className="inline-flex p-1.5 rounded-lg hover:bg-accent text-primary transition-colors border border-border"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="inline-flex p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors border border-border"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No books in catalog. Click Add to insert one.</p>
        )}
      </div>

      {/* CRUD Modal overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold border-b border-border pb-3 mb-6">
              {editingBook ? 'Edit Book Details' : 'Add New Book to Catalog'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Book Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="e.g. Foundation"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">ISBN</label>
                  <input
                    type="text"
                    required
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="e.g. 9780553293357"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Published Year</label>
                  <input
                    type="number"
                    required
                    value={publishedYear}
                    onChange={(e) => setPublishedYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Author</label>
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Category / Genre</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Total Stock Copies</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={totalCopies}
                    onChange={(e) => setTotalCopies(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Cover Image URL</label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Description / Synopsis</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                  placeholder="synopsis..."
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition-all mt-4"
              >
                {isPending ? 'Saving...' : editingBook ? 'Save Changes' : 'Create Book'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
