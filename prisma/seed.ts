import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // 1. Clean up existing database tables
  await prisma.notification.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.fine.deleteMany({});
  await prisma.borrowRecord.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.author.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.settings.deleteMany({});

  console.log('Database cleaned.');

  // 2. Seed Default Settings
  const settings = await prisma.settings.create({
    data: {
      loanDurationDays: 14,
      finePerDay: 2.50,
      maxBooksPerMember: 5,
      libraryName: 'Metropolitan Public Library',
    },
  });
  console.log('Default settings created:', settings.libraryName);

  // 3. Seed Users
  const adminPassword = await bcrypt.hash('abhi123', 10);
  const librarianPassword = await bcrypt.hash('lib123', 10);
  const memberPassword = await bcrypt.hash('member123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Amarjeet Sharma (Admin)',
      email: 'abhix1581@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const librarian = await prisma.user.create({
    data: {
      name: 'Nargish (Librarian)',
      email: 'librarian@library.com',
      password: librarianPassword,
      role: 'LIBRARIAN',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    },
  });

  const member = await prisma.user.create({
    data: {
      name: 'Amarjeet Reader (Member)',
      email: 'member@library.com',
      password: memberPassword,
      role: 'MEMBER',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  console.log('Users created:', { admin: admin.email, librarian: librarian.email, member: member.email });

  // 4. Seed Categories
  const fiction = await prisma.category.create({ data: { name: 'Fiction', slug: 'fiction' } });
  const scienceFiction = await prisma.category.create({ data: { name: 'Science Fiction', slug: 'science-fiction' } });
  const technology = await prisma.category.create({ data: { name: 'Technology', slug: 'technology' } });
  const business = await prisma.category.create({ data: { name: 'Business & Finance', slug: 'business-finance' } });
  const biography = await prisma.category.create({ data: { name: 'Biography', slug: 'biography' } });

  console.log('Categories created:', [fiction.name, scienceFiction.name, technology.name]);

  // 5. Seed Authors
  const orwell = await prisma.author.create({
    data: { name: 'George Orwell', bio: 'English novelist, essayist, journalist, and critic, famous for 1984 and Animal Farm.' }
  });
  const asimov = await prisma.author.create({
    data: { name: 'Isaac Asimov', bio: 'American writer and professor of biochemistry, known for hard science fiction and popular science.' }
  });
  const martin = await prisma.author.create({
    data: { name: 'George R.R. Martin', bio: 'American novelist and short story writer, best known for A Song of Ice and Fire series.' }
  });
  const jobsAuthor = await prisma.author.create({
    data: { name: 'Walter Isaacson', bio: 'American author, journalist, and professor, known for biographies of Steve Jobs, Albert Einstein, and Leonardo da Vinci.' }
  });

  console.log('Authors created:', [orwell.name, asimov.name, martin.name, jobsAuthor.name]);

  // 6. Seed Books
  const books = [
    {
      title: 'Nineteen Eighty-Four',
      slug: 'nineteen-eighty-four',
      isbn: '9780451524935',
      description: 'Winston Smith reins in his rebellion against the totalitarian State of Oceania, ruled by Big Brother.',
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
      totalCopies: 5,
      availableCopies: 5,
      publishedYear: 1949,
      authorId: orwell.id,
      categoryId: scienceFiction.id,
    },
    {
      title: 'Foundation',
      slug: 'foundation',
      isbn: '9780553293357',
      description: 'The first novel in Isaac Asimov\'s classic sci-fi series, detailing the collapse and rebirth of a galactic empire.',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      totalCopies: 3,
      availableCopies: 3,
      publishedYear: 1951,
      authorId: asimov.id,
      categoryId: scienceFiction.id,
    },
    {
      title: 'Steve Jobs',
      slug: 'steve-jobs',
      isbn: '9781451648539',
      description: 'The exclusive, bestselling biography of Apple co-founder Steve Jobs, based on more than forty interviews.',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      totalCopies: 4,
      availableCopies: 4,
      publishedYear: 2011,
      authorId: jobsAuthor.id,
      categoryId: biography.id,
    },
    {
      title: 'A Game of Thrones',
      slug: 'a-game-of-thrones',
      isbn: '9780553593716',
      description: 'The first book in the epic fantasy series A Song of Ice and Fire, detailing the power struggles of Westeros.',
      coverImage: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=400',
      totalCopies: 6,
      availableCopies: 5, // 1 copy issued below
      publishedYear: 1996,
      authorId: martin.id,
      categoryId: fiction.id,
    },
  ];

  const seededBooks = [];
  for (const book of books) {
    const createdBook = await prisma.book.create({ data: book });
    seededBooks.push(createdBook);
  }
  console.log('Books created:', seededBooks.map(b => b.title));

  // 7. Seed Borrow Record (1 active borrow, 1 overdue borrow, 1 returned borrow)
  const today = new Date();

  // Active issued book
  const activeRecord = await prisma.borrowRecord.create({
    data: {
      userId: member.id,
      bookId: seededBooks[3].id, // A Game of Thrones
      issueDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      dueDate: new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000), // due in 9 days
      status: 'ISSUED',
    }
  });

  // Overdue book (issued 20 days ago, due 6 days ago, returned date is null)
  const overdueRecord = await prisma.borrowRecord.create({
    data: {
      userId: member.id,
      bookId: seededBooks[0].id, // 1984
      issueDate: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      dueDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000), // due 6 days ago
      status: 'OVERDUE',
      fineAmount: 15.00, // 6 days * 2.50
    }
  });

  // Also create a fine for this overdue record
  await prisma.fine.create({
    data: {
      userId: member.id,
      borrowRecordId: overdueRecord.id,
      amount: 15.00,
      isPaid: false,
    }
  });

  // Returned book
  await prisma.borrowRecord.create({
    data: {
      userId: member.id,
      bookId: seededBooks[1].id, // Foundation
      issueDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
      dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      returnDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // returned 1 day before due
      status: 'RETURNED',
    }
  });

  // 8. Seed Reservation
  await prisma.reservation.create({
    data: {
      userId: member.id,
      bookId: seededBooks[2].id, // Steve Jobs biography
      status: 'PENDING',
    }
  });

  // 9. Seed notification
  await prisma.notification.create({
    data: {
      userId: member.id,
      message: 'Your borrowed book "Nineteen Eighty-Four" is overdue. Outstanding fine: $15.00.',
      isRead: false,
    }
  });

  console.log('Borrow records, fines, notifications, and reservations seeded successfully.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
