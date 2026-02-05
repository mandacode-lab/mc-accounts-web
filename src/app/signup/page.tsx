"use client";

import { useState } from "react";
import { usePostV1Register } from "@/lib/api/accounts";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignupPage() {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();
  const register = usePostV1Register(undefined, queryClient);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password
    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await register.mutateAsync({
        data: { identity, password },
      });

      // Check for error response
      if (response.status !== 201) {
        const errorData = response.data as { error?: string };
        setError(errorData.error || "회원가입에 실패했습니다.");
        return;
      }

      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      router.push("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError("회원가입에 실패했습니다.");
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
              회원가입
            </p>
          </div>

          {/* Description */}
          <div>
            <p className="font-normal leading-6 text-muted-foreground text-base text-center">
              Mandacode 계정을 만들어보세요
            </p>
          </div>
        </div>

        {/* Signup Form */}
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
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
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
                autoComplete="new-password"
              />
            </div>
            <p className="font-normal leading-5 text-muted-foreground text-sm">
              최소 8자 이상
            </p>
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col gap-2">
            <div className="flex h-[14px] items-center">
              <p className="font-medium leading-[14px] text-card-foreground text-sm">
                비밀번호 확인
              </p>
            </div>
            <div className="bg-input border-0 flex h-9 items-center overflow-hidden px-3 py-1 rounded-md">
              <input
                type="password"
                placeholder="••••••••"
                className="bg-transparent border-0 font-normal leading-none outline-none text-card-foreground text-sm w-full placeholder:text-muted-foreground"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}

          {/* Signup Button */}
          <button
            type="submit"
            disabled={register.isPending}
            className="bg-primary h-9 rounded-md w-full disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity text-primary-foreground font-medium text-sm"
          >
            {register.isPending ? "가입 중..." : "가입하기"}
          </button>

          {/* Login Link */}
          <div className="flex items-center justify-center gap-1">
            <p className="font-normal leading-5 text-card-foreground text-sm text-center">
              이미 계정이 있으신가요?
            </p>
            <a
              href="/login"
              className="font-normal leading-5 text-primary text-sm text-center hover:underline"
            >
              로그인
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
