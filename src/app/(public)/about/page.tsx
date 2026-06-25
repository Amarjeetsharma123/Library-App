import Link from 'next/link';
import { BookOpen, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'About Us | LibSphere',
  description: 'Learn about LibSphere library, our mission, values, and features.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">About LibSphere</h1>
        <p className="text-xl text-muted-foreground">
          Empowering readers, researchers, and library staffs with a modern, digital catalog experience.
        </p>
      </div>

      {/* Hero Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Founded in 2026, LibSphere was created with a simple vision: to make library access as intuitive and painless as possible in a digital world. We bridge the gap between physical book collections and virtual catalogs.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Whether you are a student preparing for exams, a researcher cataloging rare findings, or a passionate fiction reader waiting for the latest release, our library management system provides the ultimate tools for your literary journey.
          </p>
          <div className="pt-4">
            <Link
              href="/books"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:opacity-90 transition-all"
            >
              Browse Our Books
            </Link>
          </div>
        </div>
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-border">
          <img
            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800"
            alt="Library Interior"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Values */}
      <div className="bg-card border border-border rounded-2xl p-8 md:p-12 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold">Our Core Values</h2>
          <p className="text-muted-foreground text-sm mt-2">The principles that drive how we build our catalog and serve our community.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="p-3 bg-primary/10 text-primary rounded-lg w-fit">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Innovation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We continually upgrade our reservation logic, search indexing, and dashboard features to ensure you have a state-of-the-art catalog at your fingertips.
            </p>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-primary/10 text-primary rounded-lg w-fit">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Reliability</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real-time available copy counts, clear due-date reminders, and secure payments mean you never have to guess about your borrow records.
            </p>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-primary/10 text-primary rounded-lg w-fit">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Accessibility</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our interface is fully responsive, dark-mode compliant, and designed to meet modern accessibility standards for readers of all backgrounds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
