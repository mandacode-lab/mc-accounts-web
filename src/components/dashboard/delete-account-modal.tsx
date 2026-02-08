import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ERROR_MESSAGES } from "@/lib/errors";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.SubmitEvent) => void;
  confirmation: string;
  onConfirmationChange: (value: string) => void;
  error: string | null;
  isDeleting: boolean;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onSubmit,
  confirmation,
  onConfirmationChange,
  error,
  isDeleting,
}: DeleteAccountModalProps) {
  const t = useTranslations("dashboard.dangerZone.deleteAccount");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      titleClassName="text-destructive"
      footer={
        <div className="flex gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            type="submit"
            form="delete-account-form"
            disabled={
              isDeleting ||
              confirmation !== ERROR_MESSAGES.ACCOUNT_DELETE_CONFIRMATION
            }
          >
            {isDeleting ? t("confirming") : t("confirmButton")}
          </Button>
        </div>
      }
    >
      <form id="delete-account-form" onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-card-foreground">{t("description")}</p>
          <p className="text-sm text-muted-foreground">
            {t("modalDescription")}{" "}
            <span className="font-mono bg-muted px-1 rounded">
              {ERROR_MESSAGES.ACCOUNT_DELETE_CONFIRMATION}
            </span>
          </p>
        </div>

        <Input
          label={t("confirmationLabel")}
          value={confirmation}
          onChange={(e) => onConfirmationChange(e.target.value)}
          required
          placeholder={t("confirmationPlaceholder")}
        />

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive font-medium">경고</p>
          <p className="text-xs text-destructive mt-1">
            계정을 삭제하면 모든 프로필 정보, MFA 설정, 활성 세션이 즉시
            삭제됩니다.
          </p>
        </div>
      </form>
    </Modal>
  );
}
