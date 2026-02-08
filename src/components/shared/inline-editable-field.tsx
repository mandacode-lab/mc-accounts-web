import { useState, useRef, useEffect } from "react";

interface InlineEditableFieldProps {
  value: string | null;
  onSave: (newValue: string) => Promise<void> | void;
  placeholder?: string;
  multiline?: boolean;
  label?: string;
  emptyText?: string;
  className?: string;
}

export function InlineEditableField({
  value,
  onSave,
  placeholder = "새 값 입력",
  multiline = false,
  label,
  emptyText = "설정되지 않음",
  className,
}: InlineEditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!editingValue.trim() || saving) return;

    setSaving(true);
    try {
      await onSave(editingValue);
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save error:", err);
      // Revert on error
      setEditingValue(value || "");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditingValue(value || "");
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-sm text-muted-foreground">{label}</label>
      )}
      {isEditing ? (
        multiline ? (
          <div className="space-y-2 mt-1">
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full bg-input border-0 rounded-md px-3 py-2 text-card-foreground placeholder:text-muted-foreground min-h-[100px] resize-y"
              placeholder={placeholder}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                ESC를 누르면 취소됩니다
              </p>
              {saving && (
                <span className="text-xs text-muted-foreground">
                  저장 중...
                </span>
              )}
              {saved && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  ✓ 저장됨
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-input border-0 rounded-md px-3 py-2 text-card-foreground placeholder:text-muted-foreground"
              placeholder={placeholder}
            />
            {saving && (
              <span className="text-xs text-muted-foreground">저장 중...</span>
            )}
          </div>
        )
      ) : (
        <div
          className="mt-1 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
          onClick={() => setIsEditing(true)}
        >
          {multiline ? (
            <p className="text-card-foreground">{value || emptyText}</p>
          ) : (
            <p className="text-card-foreground font-medium">
              {value || emptyText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
