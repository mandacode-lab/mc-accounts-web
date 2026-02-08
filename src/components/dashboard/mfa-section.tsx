import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UI_CONSTANTS } from "@/lib/constants";
import { ERROR_MESSAGES } from "@/lib/errors";
import { MfaAddForm } from "./mfa-add-form";
import { MfaDeviceList } from "./mfa-device-list";
import { MfaQrVerify } from "./mfa-qr-verify";

export interface MFAItem {
  mfa_id: string;
  name: string;
  mfa_type: string;
  verified?: boolean;
}

interface MfaSectionProps {
  mfaList: MFAItem[];
  isLoading: boolean;
  onAdd: (
    name: string,
  ) => Promise<{ qr_code_url?: string; session_key?: string }>;
  onVerify: (sessionKey: string, totpCode: string) => Promise<void>;
  onDelete: (mfaId: string) => Promise<void>;
  isAdding: boolean;
  isVerifying: boolean;
  isDeleting: boolean;
}

/**
 * MfaSection - manages MFA device registration and verification
 * Coordinates between device list, add form, and QR verification
 */
export function MfaSection({
  mfaList,
  isLoading,
  onAdd,
  onVerify,
  onDelete,
  isAdding,
  isVerifying,
  isDeleting,
}: MfaSectionProps) {
  const t = useTranslations("dashboard.mfa");
  const [showAddMfa, setShowAddMfa] = useState(false);
  const [mfaName, setMfaName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");

  const handleAdd = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setQrCodeUri(null);
    setSessionKey(null);
    setTotpCode("");

    try {
      const response = await onAdd(mfaName);
      if (response.qr_code_url) {
        setQrCodeUri(response.qr_code_url);
      }
      if (response.session_key) {
        setSessionKey(response.session_key);
      }
      setSuccess(true);
      setMfaName("");
    } catch (err) {
      console.error("Add MFA error:", err);
      setError(ERROR_MESSAGES.MFA_ADD_FAILED);
    }
  };

  const handleVerify = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);

    if (!sessionKey) {
      setError("Session expired. Please try again.");
      return;
    }

    if (totpCode.length !== UI_CONSTANTS.TOTP_CODE_LENGTH) {
      setError(ERROR_MESSAGES.TOTP_CODE_REQUIRED);
      return;
    }

    try {
      await onVerify(sessionKey, totpCode);
      setSuccess(true);
      setTotpCode("");
      setSessionKey(null);
      setShowAddMfa(false);
      setTimeout(() => setSuccess(false), UI_CONSTANTS.TOAST_DURATION);
    } catch (err) {
      console.error("Verify MFA error:", err);
      setError(ERROR_MESSAGES.MFA_VERIFY_FAILED);
    }
  };

  const handleCancel = () => {
    setShowAddMfa(false);
    setMfaName("");
    setSuccess(false);
    setQrCodeUri(null);
    setSessionKey(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{t("description")}</p>

        {error && <p className="text-destructive text-sm mb-4">{error}</p>}
        {success && (
          <p className="text-green-600 dark:text-green-400 text-sm mb-4">
            ✓ MFA successfully added
          </p>
        )}

        {!showAddMfa ? (
          <div className="space-y-4">
            <Button onClick={() => setShowAddMfa(true)} fullWidth>
              + {t("addButton")}
            </Button>

            <MfaDeviceList
              mfaList={mfaList}
              isLoading={isLoading}
              isDeleting={isDeleting}
              onDelete={onDelete}
            />
          </div>
        ) : success && qrCodeUri ? (
          <MfaQrVerify
            qrCodeUri={qrCodeUri}
            sessionKey={sessionKey}
            totpCode={totpCode}
            isVerifying={isVerifying}
            onTotpCodeChange={setTotpCode}
            onVerify={handleVerify}
            onCancel={handleCancel}
          />
        ) : (
          <MfaAddForm
            mfaName={mfaName}
            isAdding={isAdding}
            onNameChange={setMfaName}
            onSubmit={handleAdd}
            onCancel={handleCancel}
          />
        )}
      </CardContent>
    </Card>
  );
}
