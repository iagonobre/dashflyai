import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: any;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-container border border-border flex items-center justify-center mb-1">
          <HugeiconsIcon icon={icon} size={22} className="text-darkText" />
        </div>
      )}
      <p className="text-textLight font-medium text-sm">{title}</p>
      {description && (
        <p className="text-darkText text-xs max-w-xs">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
