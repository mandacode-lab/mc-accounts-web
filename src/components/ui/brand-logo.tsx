import { cn } from "@/lib/utils";

export type BrandLogoSize = "sm" | "md" | "lg" | "xl";
export type BrandLogoVariant = "default" | "accent";

export interface BrandLogoProps {
  /**
   * Size of the logo
   * - sm: 32px (size-8) - for compact spaces like dashboard
   * - md: 48px (size-12) - for authentication pages
   * - lg: 80px (size-20) - for landing pages
   * - xl: 96px (size-24) - for hero sections
   * @default "md"
   */
  size?: BrandLogoSize;
  /**
   * Visual variant of the logo
   * - default: standard rounded corners
   * - accent: rounded corners with 10px radius
   * @default "default"
   */
  variant?: BrandLogoVariant;
  /**
   * Additional CSS classes to apply
   */
  className?: string;
}

const sizeClasses: Record<BrandLogoSize, string> = {
  sm: "size-8",
  md: "size-12",
  lg: "size-20",
  xl: "size-24",
};

const textSizeClasses: Record<BrandLogoSize, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-4xl",
  xl: "text-5xl",
};

const variantClasses: Record<BrandLogoVariant, string> = {
  default: "rounded-lg",
  accent: "rounded-[10px]",
};

/**
 * BrandLogo component displaying the company logo mark
 *
 * @example
 * ```tsx
 * <BrandLogo /> // Default: md size, default variant
 * ```
 *
 * @example
 * ```tsx
 * <BrandLogo size="lg" variant="accent" />
 * ```
 *
 * @example
 * // For landing pages
 * <BrandLogo size="lg" className="mb-8" />
 *
 * // For authentication pages
 * <BrandLogo size="md" variant="accent" />
 *
 * // For dashboard/sidebar
 * <BrandLogo size="sm" />
 * ```
 */
export function BrandLogo({
  size = "md",
  variant = "default",
  className,
}: BrandLogoProps) {
  return (
    <div
      className={cn(
        "bg-primary flex items-center justify-center",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      <span
        className={cn(
          "font-bold leading-7 text-primary-foreground",
          textSizeClasses[size],
        )}
      >
        M
      </span>
    </div>
  );
}
