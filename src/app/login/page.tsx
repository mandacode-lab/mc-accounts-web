"use client";

import { useState } from "react";
import { usePostV1Login, usePostV1LoginCompleteNoMfa } from "@/lib/api/auth";
import type { InternalAdapterHttpHandlerAuthLoginInitLoginRequest } from "@/lib/api/schemas/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const loginInit = usePostV1Login(undefined, queryClient);
  const loginComplete = usePostV1LoginCompleteNoMfa(undefined, queryClient);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const initResponse = await loginInit.mutateAsync({
        data: {
          id,
          password,
        } as InternalAdapterHttpHandlerAuthLoginInitLoginRequest,
      });

      // Check for error response
      if (initResponse.status !== 200) {
        const errorData = initResponse.data as { error?: string };
        setError(errorData.error || "로그인에 실패했습니다.");
        return;
      }

      const { mfa_required, pending_token } = initResponse.data;

      if (!mfa_required && pending_token) {
        // Step 2: Complete login for non-MFA users
        const completeResponse = await loginComplete.mutateAsync({
          data: { pending_token },
        });

        // Check for error response
        if (completeResponse.status !== 200) {
          const errorData = completeResponse.data as { error?: string };
          setError(errorData.error || "로그인에 실패했습니다.");
          return;
        }

        const { access_token } = completeResponse.data;
        if (access_token) {
          setAccessToken(access_token);
          // TODO: Redirect to dashboard
          alert("로그인 성공!");
        }
      } else if (mfa_required) {
        // TODO: Handle MFA flow
        alert("MFA 인증이 필요합니다.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("로그인에 실패했습니다.");
    }
  };

  return (
    <div className="bg-secondary flex min-h-screen items-center justify-center p-4 relative">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="bg-card border border-border rounded-lg w-full max-w-[448px]">
        {/* Card Header */}
        <div className="flex flex-col gap-1.5 pt-6 px-6">
          {/* Logo */}
          <div className="flex h-12 items-center justify-center">
            <div className="bg-primary rounded-[10px] size-12 flex items-center justify-center">
              <p className="font-bold leading-7 text-primary-foreground text-xl">
                M
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="h-8">
            <p className="font-medium leading-8 text-card-foreground text-2xl text-center">
              로그인
            </p>
          </div>

          {/* Description */}
          <div>
            <p className="font-normal leading-6 text-muted-foreground text-base text-center">
              Mandacode 계정으로 로그인하세요
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form
          className="flex flex-col gap-4 px-6 pt-6 pb-6"
          onSubmit={handleSubmit}
        >
          {/* ID Input */}
          <div className="flex flex-col gap-2">
            <div className="flex h-[14px] items-center">
              <p className="font-medium leading-[14px] text-card-foreground text-sm">
                아이디 / 이메일
              </p>
            </div>
            <div className="bg-input border-0 flex h-9 items-center overflow-hidden px-3 py-1 rounded-md">
              <input
                type="text"
                placeholder="your-email@example.com"
                className="bg-transparent border-0 font-normal leading-none outline-none text-card-foreground text-sm w-full placeholder:text-muted-foreground"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <div className="flex h-[14px] items-center">
              <p className="font-medium leading-[14px] text-card-foreground text-sm">
                비밀번호
              </p>
            </div>
            <div className="bg-input border-0 flex h-9 items-center overflow-hidden px-3 py-1 rounded-md">
              <input
                type="password"
                placeholder="••••••••"
                className="bg-transparent border-0 font-normal leading-none outline-none text-card-foreground text-sm w-full placeholder:text-muted-foreground"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loginInit.isPending || loginComplete.isPending}
            className="bg-primary h-9 rounded-md w-full disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity text-primary-foreground font-medium text-sm"
          >
            {loginInit.isPending || loginComplete.isPending
              ? "로그인 중..."
              : "로그인"}
          </button>

          {/* Sign Up Link */}
          <div className="flex items-center justify-center gap-1">
            <p className="font-normal leading-5 text-card-foreground text-sm text-center">
              계정이 없으신가요?
            </p>
            <a
              href="/signup"
              className="font-normal leading-5 text-primary text-sm text-center hover:underline"
            >
              회원가입
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
