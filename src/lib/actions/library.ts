'use strict';
'use server';

import { db } from '@/lib/db';
import { BorrowStatus, ReservationStatus, Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';

// Helper to check and update overdue books and calculate current fines
export async function updateOverdueLoans() {
  const today = new Date();
  const settings = await db.settings.findFirst() || { finePerDay: 1.00 };
  const finePerDay = Number(settings.finePerDay);

  // Find all ISSUED books where due date has passed
  const overdueRecords = await db.borrowRecord.findMany({
    where: {
      status: 'ISSUED',
      dueDate: { lt: today },
    },
  });

  for (const record of overdueRecords) {
    const diffTime = Math.abs(today.getTime() - record.dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const calculatedFine = diffDays * finePerDay;

    // Update record to OVERDUE and set fine amount
    await db.borrowRecord.update({
      where: { id: record.id },
      data: {
        status: 'OVERDUE',
        fineAmount: calculatedFine,
      },
    });

    // Check if Fine record already exists, if not, create it
    const existingFine = await db.fine.findFirst({
      where: { borrowRecordId: record.id },
    });

    if (!existingFine) {
      await db.fine.create({
        data: {
          userId: record.userId,
          borrowRecordId: record.id,
          amount: calculatedFine,
          isPaid: false,
        },
      });

      // Notify user
      const book = await db.book.findUnique({ where: { id: record.bookId } });
      await db.notification.create({
        data: {
          userId: record.userId,
          message: `Your borrowed book "${book?.title || 'Book'}" is now overdue. Outstanding fine is $${calculatedFine.toFixed(2)}.`,
        },
      });
    } else if (!existingFine.isPaid && Number(existingFine.amount) !== calculatedFine) {
      // Update fine amount
      await db.fine.update({
        where: { id: existingFine.id },
        data: { amount: calculatedFine },
      });
    }
  }
}

// MEMBER ACTIONS

// Reserve a book
export async function reserveBookAction(userId: string, bookId: string) {
  try {
    // Check if user is blocked
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.isBlocked) {
      return { success: false, message: 'User is blocked or does not exist.' };
    }

    const book = await db.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return { success: false, message: 'Book not found.' };
    }

    // Check if already reserved
    const existing = await db.reservation.findFirst({
      where: { userId, bookId, status: 'PENDING' },
    });
    if (existing) {
      return { success: false, message: 'You already have an active reservation for this book.' };
    }

    // Create reservation
    await db.reservation.create({
      data: {
        userId,
        bookId,
        status: 'PENDING',
      },
    });

    // Send emails
    // 1. To student/member
    await sendEmail({
      to: user.email,
      subject: `Book Reserved: ${book.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Book Reserved Successfully</h2>
          <p>Hello ${user.name},</p>
          <p>You have successfully reserved the following book:</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <strong>Title:</strong> ${book.title}<br/>
            <strong>ISBN:</strong> ${book.isbn}<br/>
            <strong>Reservation Date:</strong> ${new Date().toLocaleDateString()}
          </div>
          <p>We will notify you once a copy becomes available for pickup.</p>
        </div>
      `,
    });

    // 2. To admins/librarians
    const staff = await db.user.findMany({
      where: { role: { in: ['ADMIN', 'LIBRARIAN'] } },
      select: { email: true }
    });
    for (const staffMember of staff) {
      await sendEmail({
        to: staffMember.email,
        subject: `New Reservation: ${book.title} by ${user.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #4f46e5;">New Book Reservation Alert</h2>
            <p>A student/member has reserved a book from the library:</p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <strong>Book:</strong> ${book.title} (ISBN: ${book.isbn})<br/>
              <strong>Reserved By:</strong> ${user.name} (${user.email})<br/>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </div>
            <p>Please prepare the book copy if available.</p>
          </div>
        `,
      });
    }

    revalidatePath(`/books`);
    revalidatePath(`/books/[slug]`);
    revalidatePath(`/dashboard/reservations`);
    return { success: true, message: 'Book reserved successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to reserve book.' };
  }
}

// Cancel reservation
export async function cancelReservationAction(reservationId: string) {
  try {
    await db.reservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
    });

    revalidatePath(`/dashboard/reservations`);
    return { success: true, message: 'Reservation cancelled successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to cancel reservation.' };
  }
}

// Pay outstanding fine
export async function payFineAction(fineId: string) {
  try {
    const fine = await db.fine.update({
      where: { id: fineId },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });

    // Also update borrowRecord fine amount (optionally clear or mark paid)
    await db.borrowRecord.update({
      where: { id: fine.borrowRecordId },
      data: {
        fineAmount: 0.00,
        status: 'RETURNED', // If it was overdue but now paid
      },
    });

    revalidatePath(`/dashboard/fines`);
    revalidatePath(`/dashboard`);
    return { success: true, message: 'Fine paid successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to pay fine.' };
  }
}

// Update profile
export async function updateProfileAction(userId: string, data: { name: string; avatar?: string }) {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        avatar: data.avatar,
      },
    });
    revalidatePath(`/dashboard/profile`);
    return { success: true, message: 'Profile updated successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update profile.' };
  }
}

// Read notifications
export async function markNotificationAsRead(notificationId: string) {
  try {
    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/notifications');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}


// LIBRARIAN / STAFF ACTIONS

// Issue book
export async function issueBookAction(memberEmail: string, bookIsbn: string) {
  try {
    // 1. Fetch member and book details
    const member = await db.user.findUnique({
      where: { email: memberEmail },
      include: {
        borrowRecords: {
          where: { status: { in: ['ISSUED', 'OVERDUE'] } }
        },
        fines: {
          where: { isPaid: false }
        }
      }
    });

    if (!member) {
      return { success: false, message: 'Member not found with this email.' };
    }

    if (member.isBlocked) {
      return { success: false, message: 'Member is blocked and cannot borrow books.' };
    }

    if (member.fines.length > 0) {
      return { success: false, message: 'Member has outstanding unpaid fines.' };
    }

    const settings = await db.settings.findFirst() || { loanDurationDays: 14, maxBooksPerMember: 5 };
    if (member.borrowRecords.length >= settings.maxBooksPerMember) {
      return { success: false, message: `Member has reached the limit of ${settings.maxBooksPerMember} borrowed books.` };
    }

    const book = await db.book.findUnique({
      where: { isbn: bookIsbn },
    });

    if (!book) {
      return { success: false, message: 'Book not found with this ISBN.' };
    }

    if (book.availableCopies <= 0) {
      return { success: false, message: 'No available copies for this book.' };
    }

    // 2. Issue book in a transaction
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + settings.loanDurationDays);

    await db.$transaction([
      db.borrowRecord.create({
        data: {
          userId: member.id,
          bookId: book.id,
          dueDate,
          status: 'ISSUED',
        },
      }),
      db.book.update({
        where: { id: book.id },
        data: {
          availableCopies: { decrement: 1 },
        },
      }),
      // Fulfill any reservation if exists
      db.reservation.updateMany({
        where: { userId: member.id, bookId: book.id, status: 'PENDING' },
        data: { status: 'FULFILLED' },
      }),
    ]);

    // Send emails
    // 1. To student/member
    await sendEmail({
      to: member.email,
      subject: `Book Issued: ${book.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #10b981;">Book Issued Successfully</h2>
          <p>Hello ${member.name},</p>
          <p>A copy of the following book has been issued to your account:</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <strong>Title:</strong> ${book.title}<br/>
            <strong>ISBN:</strong> ${book.isbn}<br/>
            <strong>Issue Date:</strong> ${new Date().toLocaleDateString()}<br/>
            <strong>Due Date:</strong> ${dueDate.toLocaleDateString()}<br/>
            <strong style="color: #ef4444;">Please return the book on or before the due date to avoid fines.</strong>
          </div>
        </div>
      `,
    });

    // 2. To admins/librarians
    const staff = await db.user.findMany({
      where: { role: { in: ['ADMIN', 'LIBRARIAN'] } },
      select: { email: true }
    });
    for (const staffMember of staff) {
      await sendEmail({
        to: staffMember.email,
        subject: `Book Issued: ${book.title} to ${member.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #4f46e5;">Book Issued Notice</h2>
            <p>The following book has been issued:</p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <strong>Book:</strong> ${book.title} (ISBN: ${book.isbn})<br/>
              <strong>Issued To:</strong> ${member.name} (${member.email})<br/>
              <strong>Issue Date:</strong> ${new Date().toLocaleDateString()}<br/>
              <strong>Due Date:</strong> ${dueDate.toLocaleDateString()}
            </div>
          </div>
        `,
      });
    }

    revalidatePath('/staff');
    revalidatePath('/staff/issue-book');
    revalidatePath(`/books/${book.slug}`);
    return { success: true, message: `Book "${book.title}" successfully issued to ${member.name}.` };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to issue book.' };
  }
}

// Return book
export async function returnBookAction(borrowRecordId: string) {
  try {
    const record = await db.borrowRecord.findUnique({
      where: { id: borrowRecordId },
      include: { book: true, user: true },
    });

    if (!record) {
      return { success: false, message: 'Borrow record not found.' };
    }

    if (record.returnDate) {
      return { success: false, message: 'This book has already been returned.' };
    }

    const today = new Date();
    let fineAmount = 0;
    let isOverdue = record.status === 'OVERDUE' || today > record.dueDate;

    if (isOverdue) {
      const settings = await db.settings.findFirst() || { finePerDay: 1.00 };
      const diffTime = Math.abs(today.getTime() - record.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * Number(settings.finePerDay);
    }

    // Update in transaction
    await db.$transaction(async (tx) => {
      await tx.borrowRecord.update({
        where: { id: borrowRecordId },
        data: {
          returnDate: today,
          status: 'RETURNED',
          fineAmount: fineAmount,
        },
      });

      await tx.book.update({
        where: { id: record.bookId },
        data: {
          availableCopies: { increment: 1 },
        },
      });

      if (fineAmount > 0) {
        // Create or update fine record
        const existingFine = await tx.fine.findFirst({
          where: { borrowRecordId },
        });

        if (existingFine) {
          await tx.fine.update({
            where: { id: existingFine.id },
            data: { amount: fineAmount },
          });
        } else {
          await tx.fine.create({
            data: {
              userId: record.userId,
              borrowRecordId,
              amount: fineAmount,
              isPaid: false,
            },
          });
        }
      }
    });

    revalidatePath('/staff');
    revalidatePath('/staff/return-book');
    revalidatePath(`/books/${record.book.slug}`);
    return {
      success: true,
      message: `Book "${record.book.title}" returned successfully.${
        fineAmount > 0 ? ` Fine calculated: $${fineAmount.toFixed(2)}.` : ''
      }`,
    };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to process return.' };
  }
}


// ADMIN ACTIONS

// Helper to generate unique slugs for Categories and Books
async function generateUniqueCategorySlug(name: string, excludeId?: string): Promise<string> {
  let baseSlug = name
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (!baseSlug) {
    baseSlug = 'category';
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.category.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

async function generateUniqueBookSlug(title: string, excludeId?: string): Promise<string> {
  let baseSlug = title
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (!baseSlug) {
    baseSlug = 'book';
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.book.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Categories CRUD
export async function createCategoryAction(name: string, description?: string | null) {
  try {
    const slug = await generateUniqueCategorySlug(name);
    const category = await db.category.create({
      data: { name, slug, description },
    });
    revalidatePath('/admin/categories');
    return { success: true, message: 'Category created successfully.', category };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create category.' };
  }
}

export async function updateCategoryAction(id: string, name: string, description?: string | null) {
  try {
    const slug = await generateUniqueCategorySlug(name, id);
    const category = await db.category.update({
      where: { id },
      data: { name, slug, description },
    });
    revalidatePath('/admin/categories');
    return { success: true, message: 'Category updated successfully.', category };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update category.' };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await db.category.delete({ where: { id } });
    revalidatePath('/admin/categories');
    return { success: true, message: 'Category deleted successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete category.' };
  }
}

// Authors CRUD
export async function createAuthorAction(name: string, bio?: string | null) {
  try {
    const author = await db.author.create({
      data: { name, bio },
    });
    revalidatePath('/admin/authors');
    return { success: true, message: 'Author created successfully.', author };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create author.' };
  }
}

export async function updateAuthorAction(id: string, name: string, bio?: string | null) {
  try {
    const author = await db.author.update({
      where: { id },
      data: { name, bio },
    });
    revalidatePath('/admin/authors');
    return { success: true, message: 'Author updated successfully.', author };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update author.' };
  }
}

export async function deleteAuthorAction(id: string) {
  try {
    await db.author.delete({ where: { id } });
    revalidatePath('/admin/authors');
    return { success: true, message: 'Author deleted successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete author.' };
  }
}

// Books CRUD Actions
export async function createBookAction(data: {
  title: string;
  isbn: string;
  description?: string;
  coverImage?: string;
  totalCopies: number;
  authorId: string;
  categoryId: string;
  publishedYear?: number;
}) {
  try {
    const slug = await generateUniqueBookSlug(data.title);
    
    const book = await db.book.create({
      data: {
        ...data,
        slug,
        availableCopies: data.totalCopies,
      },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });

    revalidatePath('/admin/books');
    revalidatePath('/books');
    return { success: true, message: 'Book created successfully.', book };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create book.' };
  }
}

export async function updateBookAction(id: string, data: {
  title: string;
  isbn: string;
  description?: string;
  coverImage?: string;
  totalCopies: number;
  authorId: string;
  categoryId: string;
  publishedYear?: number;
}) {
  try {
    const slug = await generateUniqueBookSlug(data.title, id);
    
    const existing = await db.book.findUnique({ where: { id } });
    if (!existing) return { success: false, message: 'Book not found.' };

    const copiesDiff = data.totalCopies - existing.totalCopies;
    const newAvailable = Math.max(0, existing.availableCopies + copiesDiff);

    const book = await db.book.update({
      where: { id },
      data: {
        ...data,
        slug,
        availableCopies: newAvailable,
      },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });

    revalidatePath('/admin/books');
    revalidatePath(`/books/${slug}`);
    revalidatePath('/books');
    return { success: true, message: 'Book updated successfully.', book };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update book.' };
  }
}

export async function deleteBookAction(id: string) {
  try {
    await db.book.delete({ where: { id } });
    revalidatePath('/admin/books');
    revalidatePath('/books');
    return { success: true, message: 'Book deleted successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete book.' };
  }
}

// Member management
export async function toggleBlockUserAction(userId: string) {
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: 'User not found.' };

    const updated = await db.user.update({
      where: { id: userId },
      data: { isBlocked: !user.isBlocked },
    });

    revalidatePath('/admin/members');
    revalidatePath('/admin/librarians');
    return { success: true, message: `User is now ${updated.isBlocked ? 'blocked' : 'unblocked'}.` };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to toggle user block status.' };
  }
}

export async function updateUserRoleAction(userId: string, role: Role) {
  try {
    await db.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidatePath('/admin/members');
    revalidatePath('/admin/librarians');
    return { success: true, message: `User role updated to ${role}.` };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update role.' };
  }
}

// Settings management
export async function updateSettingsAction(data: {
  libraryName: string;
  loanDurationDays: number;
  finePerDay: number;
  maxBooksPerMember: number;
}) {
  try {
    const settings = await db.settings.findFirst();
    if (settings) {
      await db.settings.update({
        where: { id: settings.id },
        data,
      });
    } else {
      await db.settings.create({
        data,
      });
    }
    revalidatePath('/admin/settings');
    return { success: true, message: 'Library settings updated successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update settings.' };
  }
}
