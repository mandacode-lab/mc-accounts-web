import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UI_CONSTANTS } from "@/lib/constants";

interface MfaQrVerifyProps {
  qrCodeUri: string;
  sessionKey: string | null;
  totpCode: string;
  isVerifying: boolean;
  onTotpCodeChange: (code: string) => void;
  onVerify: (e: React.SubmitEvent) => Promise<void>;
  onCancel: () => void;
}

/**
 * MfaQrVerify - displays QR code and verification form
 */
export function MfaQrVerify({
  qrCodeUri,
  sessionKey,
  totpCode,
  isVerifying,
  onTotpCodeChange,
  onVerify,
  onCancel,
}: MfaQrVerifyProps) {
  const t = useTranslations("dashboard.mfa");
  const tCommon = useTranslations("common");

  return (
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
        <form onSubmit={onVerify} className="space-y-4 pt-4">
          <Input
            label={`Verification code (${UI_CONSTANTS.TOTP_CODE_LENGTH} digits)`}
            type="text"
            value={totpCode}
            onChange={(e) => onTotpCodeChange(e.target.value)}
            maxLength={6}
            placeholder={t("codePlaceholder")}
            className="text-center text-lg tracking-widest"
          />
          <Button type="submit" disabled={isVerifying} fullWidth>
            {isVerifying ? t("verifying") : t("verifyButton")}
          </Button>
        </form>
      ) : (
        <Button type="button" variant="ghost" onClick={onCancel} fullWidth>
          {tCommon("cancel")}
        </Button>
      )}
    </div>
  );
}
