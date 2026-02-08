import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = "text", id, ...props }, ref) => {
    const inputId = id || `input-${label?.replace(/\s+/g, "-") || "field"}`;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-card-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "w-full bg-input border-0 rounded-md px-3 py-2 text-card-foreground placeholder:text-muted-foreground",
            error && "border-destructive",
            className,
          )}
          {...props}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
