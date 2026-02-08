import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UI_CONSTANTS } from "@/lib/constants";
import { ERROR_MESSAGES } from "@/lib/errors";

interface MFAItem {
  mfa_id: string;
  name: string;
  mfa_type: string;
  verified?: boolean;
}

interface MfaSectionProps {
  mfaList: MFAItem[];
  isLoading: boolean;
  onAdd: (name: string) => Promise<{ qr_code_url?: string; session_key?: string }>;
  onVerify: (sessionKey: string, totpCode: string) => Promise<void>;
  onDelete: (mfaId: string) => Promise<void>;
  isAdding: boolean;
  isVerifying: boolean;
  isDeleting: boolean;
}

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
  const t = useTranslations('dashboard.mfa');
  const tCommon = useTranslations('common');
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

  const handleDelete = async (mfaId: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    setError(null);
    try {
      await onDelete(mfaId);
    } catch (err) {
      console.error("Delete MFA error:", err);
      setError(ERROR_MESSAGES.MFA_DELETE_FAILED);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t('description')}
        </p>

        {error && (
          <p className="text-destructive text-sm mb-4">{error}</p>
        )}
        {success && (
          <p className="text-green-600 dark:text-green-400 text-sm mb-4">
            ✓ MFA successfully added
          </p>
        )}

        {!showAddMfa ? (
          <div className="space-y-4">
            <Button
              onClick={() => setShowAddMfa(true)}
              fullWidth
            >
              + {t('addButton')}
            </Button>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('enabled')}
              </h3>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
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
                        <p className="text-xs text-muted-foreground">
                          {mfa.mfa_type}
                        </p>
                        {mfa.verified !== undefined && (
                          <p className={`text-xs ${mfa.verified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                            {mfa.verified ? '✓ Verified' : '⏳ Pending verification'}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(mfa.mfa_id)}
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive-foreground text-sm disabled:opacity-50"
                      >
                        {tCommon('delete')}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {t('noDevices')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {success && qrCodeUri ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-card-foreground mb-2">
                    ✓ MFA device registered
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Scan the QR code to register with your authenticator app
                  </p>
                </div>
                <div className="flex justify-center p-4 bg-white rounded-md">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUri)}`}
                    alt="QR Code"
                    width={192}
                    height={192}
                    className="w-48 h-48"
                  />
                </div>
                {sessionKey ? (
                  <form onSubmit={handleVerify} className="space-y-4 pt-4">
                    <Input
                      label={`Verification code (${UI_CONSTANTS.TOTP_CODE_LENGTH} digits)`}
                      type="text"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      maxLength={6}
                      placeholder={t('codePlaceholder')}
                      className="text-center text-lg tracking-widest"
                    />
                    <Button
                      type="submit"
                      disabled={isVerifying}
                      fullWidth
                    >
                      {isVerifying ? t('verifying') : t('verifyButton')}
                    </Button>
                  </form>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowAddMfa(false);
                      setSuccess(false);
                      setQrCodeUri(null);
                      setSessionKey(null);
                    }}
                    fullWidth
                  >
                    {tCommon('cancel')}
                  </Button>
                )}
              </div>
            ) : (
              <form onSubmit={handleAdd} className="space-y-4">
                <Input
                  label="Device name"
                  type="text"
                  value={mfaName}
                  onChange={(e) => setMfaName(e.target.value)}
                  required
                  placeholder={t('namePlaceholder')}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">
                    Authentication method
                  </label>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddMfa(false);
                      setMfaName("");
                    }}
                  >
                    {tCommon('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isAdding}
                  >
                    {isAdding ? "Adding..." : "Add"}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
