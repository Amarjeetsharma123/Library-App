import { db } from '@/lib/db';
import { updateOverdueLoans } from '@/lib/actions/library';
import StatCard from '@/components/ui/StatCard';
import AnalyticsCharts from './AnalyticsCharts';
import { BookOpen, Users, AlertTriangle, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Analytics Overview | LibSphere',
};

export default async function AdminDashboardPage() {
  // Update overdue records
  await updateOverdueLoans();

  // Aggregate stats
  const [bookSum, memberCount, activeLoans, unpaidFinesAgg] = await Promise.all([
    db.book.aggregate({ _sum: { totalCopies: true } }),
    db.user.count({ where: { role: 'MEMBER' } }),
    db.borrowRecord.count({ where: { status: { in: ['ISSUED', 'OVERDUE'] } } }),
    db.fine.aggregate({
      where: { isPaid: false },
      _sum: { amount: true },
    }),
  ]);

  const totalBooks = bookSum._sum.totalCopies || 0;
  const totalFines = unpaidFinesAgg._sum.amount ? Number(unpaidFinesAgg._sum.amount) : 0;

  // Query categories count for Pie Chart
  const categories = await db.category.findMany({
    include: {
      _count: { select: { books: true } },
    },
    take: 6,
  });

  const genreData = categories.map((cat) => ({
    name: cat.name,
    value: cat._count.books,
  }));

  // Mock Monthly borrowing data
  const monthlyData = [
    { name: 'Jan', loans: 12 },
    { name: 'Feb', loans: 19 },
    { name: 'Mar', loans: 32 },
    { name: 'Apr', loans: 26 },
    { name: 'May', loans: 45 },
    { name: 'Jun', loans: 55 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Console</h1>
        <p className="text-muted-foreground mt-1">Review comprehensive analytics, manage system inventories, and monitor library activities.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Books In Stock"
          value={totalBooks}
          description="Across all categories"
          icon={BookOpen}
          color="text-indigo-600 bg-indigo-500/10"
        />
        <StatCard
          title="Registered Readers"
          value={memberCount}
          description="Active library cards"
          icon={Users}
          color="text-emerald-605 bg-emerald-500/10"
        />
        <StatCard
          title="Active Checkouts"
          value={activeLoans}
          description="Currently borrowed copies"
          icon={AlertTriangle}
          color="text-amber-600 bg-amber-500/10"
        />
        <StatCard
          title="Outstanding Fines"
          value={`$${totalFines.toFixed(2)}`}
          description="Unpaid late return fees"
          icon={DollarSign}
          color={totalFines > 0 ? 'text-rose-600 bg-rose-500/10' : 'text-slate-655 bg-slate-500/10'}
        />
      </div>

      {/* Analytics Charts Component */}
      <AnalyticsCharts genreData={genreData} monthlyData={monthlyData} />
    </div>
  );
}
