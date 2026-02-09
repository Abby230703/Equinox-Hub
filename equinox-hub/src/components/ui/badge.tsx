import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "secondary";
  size?: "sm" | "md";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const variants = {
      default: "bg-gray-100 text-gray-700",
      success: "bg-green-100 text-green-700",
      warning: "bg-amber-100 text-amber-700",
      danger: "bg-red-100 text-red-700",
      info: "bg-blue-100 text-blue-700",
      secondary: "bg-purple-100 text-purple-700",
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

export { Badge, StatusBadge };
