import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MfaAddFormProps {
  mfaName: string;
  isAdding: boolean;
  onNameChange: (name: string) => void;
  onSubmit: (e: React.SubmitEvent) => Promise<void>;
  onCancel: () => void;
}

/**
 * MfaAddForm - form to add a new MFA device
 */
export function MfaAddForm({
  mfaName,
  isAdding,
  onNameChange,
  onSubmit,
  onCancel,
}: MfaAddFormProps) {
  const t = useTranslations("dashboard.mfa");
  const tCommon = useTranslations("common");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Device name"
        type="text"
        value={mfaName}
        onChange={(e) => onNameChange(e.target.value)}
        required
        placeholder={t("namePlaceholder")}
      />

      <div className="space-y-2">
        <span className="text-sm font-medium text-card-foreground">
          Authentication method
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground"
          >
            TOTP
          </button>
          <button
            type="button"
            disabled
            className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground cursor-not-allowed"
          >
            SMS
          </button>
          <button
            type="button"
            disabled
            className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground cursor-not-allowed"
          >
            Email
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Use an authenticator app like Google Authenticator
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={isAdding}>
          {isAdding ? "Adding..." : "Add"}
        </Button>
      </div>
    </form>
  );
}
