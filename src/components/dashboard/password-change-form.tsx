import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UI_CONSTANTS } from "@/lib/constants";
import { ERROR_MESSAGES } from "@/lib/errors";

interface PasswordChangeFormProps {
  onSubmit: (data: {
    current_password: string;
    new_password: string;
  }) => Promise<void>;
  isPending: boolean;
}

export function PasswordChangeForm({
  onSubmit,
  isPending,
}: PasswordChangeFormProps) {
  const t = useTranslations("dashboard.security");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError(ERROR_MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    try {
      await onSubmit({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), UI_CONSTANTS.TOAST_DURATION);
    } catch (err) {
      console.error("Password change error:", err);
      setError(ERROR_MESSAGES.PASSWORD_CHANGE_FAILED);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("currentPassword.label")}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder={t("currentPassword.placeholder")}
          />

          <Input
            label={t("newPassword.label")}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder={t("newPassword.placeholder")}
          />

          <Input
            label={t("confirmPassword.label")}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder={t("confirmPassword.placeholder")}
          />

          {error && <p className="text-destructive text-sm">{error}</p>}

          {success && (
            <p className="text-green-600 dark:text-green-400 text-sm">
              {t("success")}
            </p>
          )}

          <Button type="submit" disabled={isPending} fullWidth>
            {isPending ? t("submitting") : t("submitButton")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
