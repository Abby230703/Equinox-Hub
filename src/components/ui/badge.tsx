import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "secondary" | "outline";
  size?: "sm" | "md";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const variants = {
      default: "bg-zinc-700 text-zinc-300",
      success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
      warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      danger: "bg-red-500/10 text-red-500 border border-red-500/20",
      info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      secondary: "bg-zinc-800 text-zinc-400 border border-zinc-700",
      outline: "border border-border text-muted-foreground",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-xs",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium rounded-full",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// Validation badge for import system
interface ValidationBadgeProps {
  status: "valid" | "warning" | "error";
}

const ValidationBadge: React.FC<ValidationBadgeProps> = ({ status }) => {
  const config: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    valid: { label: "Valid", variant: "success" },
    warning: { label: "Warning", variant: "warning" },
    error: { label: "Error", variant: "danger" },
  };

  const { label, variant } = config[status] || config.valid;

  return <Badge variant={variant}>{label}</Badge>;
};

// Status-specific badge for quotations
interface StatusBadgeProps {
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config: Record<
    string,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    DRAFT: { label: "Draft", variant: "default" },
    SENT: { label: "Sent", variant: "info" },
    ACCEPTED: { label: "Accepted", variant: "success" },
    REJECTED: { label: "Rejected", variant: "danger" },
    EXPIRED: { label: "Expired", variant: "warning" },
  };

  const { label, variant } = config[status] || config.DRAFT;

  return <Badge variant={variant}>{label}</Badge>;
};

export { Badge, StatusBadge, ValidationBadge };
