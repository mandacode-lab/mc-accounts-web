"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getLocalePath, ROUTES } from "@/lib/constants";

export default function SignupCompletePage() {
  const t = useTranslations("signupComplete");
  const locale = useLocale();

  return (
    <div className="bg-secondary flex min-h-screen items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-[448px]">
        <div className="flex flex-col gap-1.5 pt-6 px-6">
          <div className="flex h-12 items-center justify-center">
            <div className="bg-primary rounded-[10px] size-12 flex items-center justify-center">
              <p className="font-bold leading-7 text-primary-foreground text-xl">
                M
              </p>
            </div>
          </div>

          <div className="h-8">
            <p className="font-medium leading-8 text-card-foreground text-2xl text-center">
              {t("title")}
            </p>
          </div>

          <div>
            <p className="font-normal leading-6 text-muted-foreground text-base text-center">
              {t("description")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 pt-6 pb-6">
          <div className="flex flex-col gap-2">
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm text-card-foreground text-center">
                {t("message")}
              </p>
            </div>
          </div>

          <Link
            href={getLocalePath(locale, ROUTES.LOGIN)}
            className="bg-primary h-9 rounded-md w-full hover:opacity-90 transition-opacity text-primary-foreground font-medium text-sm flex items-center justify-center"
          >
            {t("loginButton")}
          </Link>
        </div>
      </div>
    </div>
  );
}
