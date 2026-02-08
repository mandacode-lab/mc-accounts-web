import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", fullWidth = false, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-primary text-primary-foreground hover:opacity-90 transition-opacity":
              variant === "default",
            "bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity":
              variant === "destructive",
            "border border-border text-card-foreground hover:bg-accent":
              variant === "outline",
            "bg-muted text-card-foreground hover:bg-accent":
              variant === "ghost",
            "w-full": fullWidth,
            "flex-1": fullWidth,
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
