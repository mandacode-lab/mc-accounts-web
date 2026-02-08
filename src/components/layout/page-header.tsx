import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  /**
   * Whether to show the language switcher
   * @default true
   */
  showLanguageSwitcher?: boolean;
  /**
   * Whether to show the theme toggle
   * @default true
   */
  showThemeToggle?: boolean;
  /**
   * Additional CSS classes to apply
   */
  className?: string;
}

/**
 * PageHeader component that displays language switcher and theme toggle
 * Fixed positioned header controls for authentication and landing pages
 *
 * @example
 * ```tsx
 * <PageHeader />
 * ```
 *
 * @example
 * ```tsx
 * <PageHeader
 *   showLanguageSwitcher={true}
 *   showThemeToggle={true}
 *   className="top-8 right-8"
 * />
 * ```
 */
export function PageHeader({
  showLanguageSwitcher = true,
  showThemeToggle = true,
  className,
}: PageHeaderProps) {
  if (!showLanguageSwitcher && !showThemeToggle) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 flex items-center gap-2 z-50",
        className,
      )}
    >
      {showLanguageSwitcher && <LanguageSwitcher />}
      {showThemeToggle && <ThemeToggle />}
    </div>
  );
}
