import { LucideIcon, Inbox } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-border bg-card/50">
      <div className="p-4 bg-muted/50 rounded-2xl text-muted-foreground">
        <Icon className="h-10 w-10" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
      {actionLabel && actionHref && (
        <div className="mt-6">
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 rounded-lg shadow-md shadow-primary/10 transition-all"
          >
            {actionLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
