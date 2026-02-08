"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { BrandLogo } from "@/components/ui/brand-logo";
import { usePostV1Register } from "@/lib/api/accounts";
import {
  getLocalePath,
  HTTP_STATUS,
  ROUTES,
  UI_CONSTANTS,
} from "@/lib/constants";
import { ERROR_MESSAGES } from "@/lib/errors";

export default function SignupPage() {
  const t = useTranslations("signup");
  const locale = useLocale();
  const router = useRouter();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const register = usePostV1Register(undefined, queryClient);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < UI_CONSTANTS.PASSWORD_MIN_LENGTH) {
      setError(ERROR_MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }

    if (password !== confirmPassword) {
      setError(ERROR_MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    try {
      const response = await register.mutateAsync({
        data: { identity, password },
      });

      if (response.status !== HTTP_STATUS.CREATED) {
        const errorData = response.data as { error?: string };
        setError(errorData.error || ERROR_MESSAGES.SIGNUP_FAILED);
        return;
      }

      router.push(getLocalePath(locale, ROUTES.SIGNUP_COMPLETE));
    } catch (err) {
      console.error("Signup error:", err);
      setError(ERROR_MESSAGES.SIGNUP_FAILED);
    }
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
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
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
                autoComplete="new-password"
              />
            </div>
            <p className="font-normal leading-5 text-muted-foreground text-sm">
              {t("passwordMinLength", {
                minLength: UI_CONSTANTS.PASSWORD_MIN_LENGTH,
              })}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex h-[14px] items-center">
              <p className="font-medium leading-[14px] text-card-foreground text-sm">
                {t("confirmPasswordLabel")}
              </p>
            </div>
            <div className="bg-input border-0 flex h-9 items-center overflow-hidden px-3 py-1 rounded-md">
              <input
                type="password"
                placeholder={t("confirmPasswordPlaceholder")}
                className="bg-transparent border-0 font-normal leading-none outline-none text-card-foreground text-sm w-full placeholder:text-muted-foreground"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={register.isPending}
            className="bg-primary h-9 rounded-md w-full disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity text-primary-foreground font-medium text-sm"
          >
            {register.isPending ? t("signupButtonLoading") : t("signupButton")}
          </button>

          <div className="flex items-center justify-center gap-1">
            <p className="font-normal leading-5 text-card-foreground text-sm text-center">
              {t("hasAccount")}
            </p>
            <a
              href={getLocalePath(locale, ROUTES.LOGIN)}
              className="font-normal leading-5 text-primary text-sm text-center hover:underline"
            >
              {t("loginLink")}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
