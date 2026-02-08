import { useTranslations } from "next-intl";
import type { MFAItem } from "./mfa-section";

interface MfaDeviceListProps {
  mfaList: MFAItem[];
  isLoading: boolean;
  isDeleting: boolean;
  onDelete: (mfaId: string) => Promise<void>;
}

/**
 * MfaDeviceList - displays the list of registered MFA devices
 */
export function MfaDeviceList({
  mfaList,
  isLoading,
  isDeleting,
  onDelete,
}: MfaDeviceListProps) {
  const t = useTranslations("dashboard.mfa");
  const tCommon = useTranslations("common");

  const handleDelete = async (mfaId: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    await onDelete(mfaId);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        {t("enabled")}
      </h3>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
      ) : mfaList.length > 0 ? (
        <div className="space-y-2">
          {mfaList.map((mfa) => (
            <div
              key={mfa.mfa_id}
              className="flex items-center justify-between p-3 bg-muted rounded-md"
            >
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  {mfa.name}
                </p>
                <p className="text-xs text-muted-foreground">{mfa.mfa_type}</p>
                {mfa.verified !== undefined && (
                  <p
                    className={`text-xs ${mfa.verified ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}
                  >
                    {mfa.verified ? "✓ Verified" : "⏳ Pending verification"}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(mfa.mfa_id)}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive-foreground text-sm disabled:opacity-50"
              >
                {tCommon("delete")}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">{t("noDevices")}</p>
      )}
    </div>
  );
}
