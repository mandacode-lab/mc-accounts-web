"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  usePostV1Login,
  usePostV1LoginCompleteNoMfa,
  usePostV1LoginCompleteTotp,
  usePostV1TokenRefresh,
} from "@/lib/api/auth";
import type { InternalAdapterHttpHandlerAuthLoginInitLoginRequest } from "@/lib/api/schemas/auth";
import {
  getLocalePath,
  HTTP_STATUS,
  ROUTES,
  UI_CONSTANTS,
} from "@/lib/constants";
import { ERROR_MESSAGES } from "@/lib/errors";
import { useAuth } from "@/lib/hooks/useAuth";

export default function LoginPage() {
  const t = useTranslations("login");
  const locale = useLocale();
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [totpCode, setTotpCode] = useState("");

  const queryClient = useQueryClient();
  const { login: setLoginToken } = useAuth();

  const loginInit = usePostV1Login(
    {
      fetch: { credentials: "include" as const },
    },
    queryClient,
  );
  const loginComplete = usePostV1LoginCompleteNoMfa(
    {
      fetch: { credentials: "include" as const },
    },
    queryClient,
  );
  const loginMfaComplete = usePostV1LoginCompleteTotp(
    {
      fetch: { credentials: "include" as const },
    },
    queryClient,
  );
  const tokenRefresh = usePostV1TokenRefresh(
    {
      fetch: { credentials: "include" as const },
    },
    queryClient,
  );

  // Check existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const refreshResponse = await tokenRefresh.mutateAsync(undefined);

        if (
          refreshResponse.status === 200 &&
          refreshResponse.data.access_token
        ) {
          // Valid session exists, redirect to dashboard
          setLoginToken(refreshResponse.data.access_token);
          router.push(getLocalePath(locale, ROUTES.DASHBOARD));
        }
      } catch (_error) {
        // No valid session, clear any stale tokens
        console.log("No valid session found");
      }
    };

    checkExistingSession();
  }, [
    locale,
    router.push, // Valid session exists, redirect to dashboard
    setLoginToken,
    tokenRefresh.mutateAsync,
  ]); // Run only on mount

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);

    if (showMfaInput && pendingToken) {
      if (totpCode.length !== UI_CONSTANTS.TOTP_CODE_LENGTH) {
        setError(ERROR_MESSAGES.TOTP_CODE_REQUIRED);
        return;
      }

      try {
        const mfaResponse = await loginMfaComplete.mutateAsync({
          data: {
            pending_token: pendingToken,
            totp_code: totpCode,
          },
        });

        if (mfaResponse.status !== HTTP_STATUS.OK) {
          const errorData = mfaResponse.data as { error?: string };
          setError(errorData.error || ERROR_MESSAGES.MFA_VERIFICATION_FAILED);
          return;
        }

        const { access_token } = mfaResponse.data;
        if (access_token) {
          setLoginToken(access_token);
          router.push(getLocalePath(locale, ROUTES.DASHBOARD));
        }
      } catch (err) {
        console.error("MFA verification error:", err);
        setError(ERROR_MESSAGES.MFA_VERIFICATION_FAILED);
      }
      return;
    }

    try {
      const initResponse = await loginInit.mutateAsync({
        data: {
          id,
          password,
        } as InternalAdapterHttpHandlerAuthLoginInitLoginRequest,
      });

      if (initResponse.status !== HTTP_STATUS.OK) {
        const errorData = initResponse.data as { error?: string };
        setError(errorData.error || ERROR_MESSAGES.LOGIN_FAILED);
        return;
      }

      const { mfa_required, pending_token: token } = initResponse.data;

      if (!mfa_required && token) {
        const completeResponse = await loginComplete.mutateAsync({
          data: { pending_token: token },
        });

        if (completeResponse.status !== HTTP_STATUS.OK) {
          const errorData = completeResponse.data as { error?: string };
          setError(errorData.error || ERROR_MESSAGES.LOGIN_FAILED);
          return;
        }

        const { access_token } = completeResponse.data;
        if (access_token) {
          setLoginToken(access_token);
          router.push(getLocalePath(locale, ROUTES.DASHBOARD));
        }
      } else if (mfa_required) {
        setPendingToken(token || null);
        setShowMfaInput(true);
        setError(null);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(ERROR_MESSAGES.LOGIN_FAILED);
    }
  };

  const handleBackToLogin = () => {
    setShowMfaInput(false);
    setPendingToken(null);
    setTotpCode("");
    setError(null);
  };

  return (
    <div className="bg-secondary flex min-h-screen items-center justify-center p-4">
      <PageHeader />

      <div className="bg-card border border-border rounded-lg w-full max-w-[448px]">
        <div className="flex flex-col gap-1.5 pt-6 px-6">
          <div className="flex h-12 items-center justify-center">
            <BrandLogo size="md" variant="accent" />
          </div>

          <div className="h-8">
            <p className="font-medium leading-8 text-card-foreground text-2xl text-center">
              {t("title")}
            </p>
          </div>

          <div>
            <p className="font-normal leading-6 text-muted-foreground text-base text-center">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {!showMfaInput ? (
          <form
            className="flex flex-col gap-4 px-6 pt-6 pb-6"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <div className="flex h-[14px] items-center">
                <p className="font-medium leading-[14px] text-card-foreground text-sm">
                  {t("idLabel")}
                </p>
              </div>
              <div className="bg-input border-0 flex h-9 items-center overflow-hidden px-3 py-1 rounded-md">
                <input
                  type="text"
                  placeholder={t("idPlaceholder")}
                  className="bg-transparent border-0 font-normal leading-none outline-none text-card-foreground text-sm w-full placeholder:text-muted-foreground"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex h-[14px] items-center">
                <p className="font-medium leading-[14px] text-card-foreground text-sm">
                  {t("passwordLabel")}
                </p>
              </div>
              <div className="bg-input border-0 flex h-9 items-center overflow-hidden px-3 py-1 rounded-md">
                <input
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  className="bg-transparent border-0 font-normal leading-none outline-none text-card-foreground text-sm w-full placeholder:text-muted-foreground"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loginInit.isPending || loginComplete.isPending}
              className="bg-primary h-9 rounded-md w-full disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity text-primary-foreground font-medium text-sm"
            >
              {loginInit.isPending || loginComplete.isPending
                ? t("loginButtonLoading")
                : t("loginButton")}
            </button>

            <div className="flex items-center justify-center gap-1">
              <p className="font-normal leading-5 text-card-foreground text-sm text-center">
                {t("noAccount")}
              </p>
              <a
                href={getLocalePath(locale, ROUTES.SIGNUP)}
                className="font-normal leading-5 text-primary text-sm text-center hover:underline"
              >
                {t("signupLink")}
              </a>
            </div>
          </form>
        ) : (
          <form
            className="flex flex-col gap-4 px-6 pt-6 pb-6"
            onSubmit={handleSubmit}
          >
            <div className="text-center pb-2">
              <p className="font-normal leading-6 text-card-foreground text-base">
                {t("mfaRequired")}
              </p>
              <p className="font-normal leading-5 text-muted-foreground text-sm mt-2">
                {t("mfaDescription", {
                  codeLength: UI_CONSTANTS.TOTP_CODE_LENGTH,
                })}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex h-[14px] items-center">
                <p className="font-medium leading-[14px] text-card-foreground text-sm">
                  {t("verificationCodeLabel")}
                </p>
              </div>
              <div className="bg-input border-0 flex h-12 items-center overflow-hidden px-3 py-1 rounded-md justify-center">
                <input
                  type="text"
                  placeholder={t("verificationCodePlaceholder")}
                  className="bg-transparent border-0 font-normal leading-none outline-none text-card-foreground text-2xl w-full placeholder:text-muted-foreground text-center tracking-[0.5em]"
                  value={totpCode}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, UI_CONSTANTS.TOTP_CODE_LENGTH);
                    setTotpCode(value);
                  }}
                  maxLength={UI_CONSTANTS.TOTP_CODE_LENGTH}
                  required
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </div>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              type="submit"
              disabled={
                loginMfaComplete.isPending ||
                totpCode.length !== UI_CONSTANTS.TOTP_CODE_LENGTH
              }
              className="bg-primary h-9 rounded-md w-full disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity text-primary-foreground font-medium text-sm"
            >
              {loginMfaComplete.isPending
                ? t("verifyButtonLoading")
                : t("verifyButton")}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-muted-foreground hover:text-card-foreground text-sm transition-colors"
            >
              {t("backToLogin")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
