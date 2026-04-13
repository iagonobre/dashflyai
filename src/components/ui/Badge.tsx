import { cn } from "@/lib/utils";

type BadgeVariant =
  | "pending"
  | "sent"
  | "rejected"
  | "blacklist"
  | "approved"
  | "default"
  | "success"
  | "warning"
  | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  pending:   "bg-yellowAlert/10 text-yellowAlert border-yellowAlert/30",
  sent:      "bg-greenAlert/10 text-greenAlert border-greenAlert/30",
  approved:  "bg-greenAlert/10 text-greenAlert border-greenAlert/30",
  rejected:  "bg-redAlert/10 text-redAlert border-redAlert/30",
  blacklist: "bg-redAlert/15 text-redAlert border-redAlert/40",
  success:   "bg-greenAlert/10 text-greenAlert border-greenAlert/30",
  warning:   "bg-yellowAlert/10 text-yellowAlert border-yellowAlert/30",
  info:      "bg-blueAlert/10 text-blueAlert border-blueAlert/30",
  default:   "bg-container text-darkText border-border",
};

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
