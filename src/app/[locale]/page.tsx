"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ROUTES, getLocalePath } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleLogin = () => {
    router.push(getLocalePath(locale, ROUTES.LOGIN));
  };

  const handleSignup = () => {
    router.push(getLocalePath(locale, ROUTES.SIGNUP));
  };

  const handleDashboard = () => {
    router.push(getLocalePath(locale, ROUTES.DASHBOARD));
  };

  return (
    <div className="bg-secondary min-h-screen">
      {/* Header controls */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="bg-primary rounded-lg size-20 flex items-center justify-center">
                <span className="font-bold text-primary-foreground text-4xl">
                  M
                </span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-card-foreground mb-4">
              {t("title")}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {t("subtitle")}
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {t("features.security.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("features.security.description")}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {t("features.convenience.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("features.convenience.description")}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {t("features.integration.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("features.integration.description")}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated() ? (
              <button
                onClick={handleDashboard}
                className="bg-primary text-primary-foreground hover:opacity-90 transition-opacity px-8 py-3 rounded-md font-medium text-base w-full sm:w-auto"
              >
                {t("cta.dashboard")}
              </button>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="bg-primary text-primary-foreground hover:opacity-90 transition-opacity px-8 py-3 rounded-md font-medium text-base w-full sm:w-auto"
                >
                  {t("cta.login")}
                </button>
                <button
                  onClick={handleSignup}
                  className="border border-border bg-card hover:bg-accent transition-colors px-8 py-3 rounded-md font-medium text-base text-card-foreground w-full sm:w-auto"
                >
                  {t("cta.signup")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
