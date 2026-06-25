import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = 'text-primary bg-primary/10',
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h4 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</h4>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
