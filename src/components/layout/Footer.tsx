import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl">
              <BookOpen className="h-6 w-6 stroke-[2.5]" />
              <span>LibSphere</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              A state-of-the-art solution for managing modern libraries, facilitating smooth borrowing, instant reservations, and hassle-free staff workflows.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Catalog</h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="/books" className="text-sm text-muted-foreground hover:text-foreground">
                      Browse Books
                    </Link>
                  </li>
                  <li>
                    <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground">
                      Genres & Categories
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Support</h3>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                      About Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Library Hours</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Monday - Friday: 8:00 AM - 8:00 PM</li>
                <li>Saturday: 9:00 AM - 5:00 PM</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LibSphere Library. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
