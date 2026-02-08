import { useTranslations } from "next-intl";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
  currentAvatarUrl: string | null;
  isUploading: boolean;
}

export function AvatarUploadModal({
  isOpen,
  onClose,
  onConfirm,
  currentAvatarUrl,
  isUploading,
}: AvatarUploadModalProps) {
  const t = useTranslations("dashboard.profile.avatar");
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleConfirm = () => {
    if (avatarUrl.trim()) {
      onConfirm(avatarUrl.trim());
      setAvatarUrl("");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      footer={
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isUploading || !avatarUrl.trim()}
          >
            {isUploading ? t("confirmLoading") : t("confirm")}
          </Button>
        </div>
      }
    >
      {/* Preview */}
      <div className="flex justify-center mb-6">
        <Avatar src={avatarUrl || currentAvatarUrl} size="lg" />
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <label
          htmlFor="avatar-url"
          className="text-sm font-medium text-card-foreground"
        >
          {t("urlLabel")}
        </label>
        <input
          id="avatar-url"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder={t("urlPlaceholder")}
          className="w-full px-3 py-2 bg-input border-0 rounded-md text-card-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isUploading}
        />
        <p className="text-xs text-muted-foreground">{t("urlHelp")}</p>
      </div>
    </Modal>
  );
}
