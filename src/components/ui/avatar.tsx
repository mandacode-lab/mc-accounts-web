import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  editable?: boolean;
  onEdit?: () => void;
  loading?: boolean;
}

export function Avatar({
  src,
  alt = "Avatar",
  size = "md",
  className,
  editable = false,
  onEdit,
  loading = false,
}: AvatarProps) {
  const sizeClasses = {
    sm: "size-12",
    md: "size-20",
    lg: "size-32",
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div
        className={cn(
          "rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden relative",
          sizeClasses[size],
        )}
      >
        {src ? (
          <Image src={src} alt={alt} fill className="object-cover" />
        ) : (
          <span className={cn("text-muted-foreground", textSizes[size])}>
            ?
          </span>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
          <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {editable && onEdit && (
        <div
          className="absolute inset-0 rounded-full bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={onEdit}
        >
          <span className="text-white text-xs font-medium">변경</span>
        </div>
      )}
    </div>
  );
}
