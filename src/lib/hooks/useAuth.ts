import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { ROUTES, getLocalePath } from "@/lib/constants";

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const login = useCallback(
    (token: string) => {
      setAccessToken(token);
    },
    [setAccessToken],
  );

  const logout = useCallback(() => {
    setAccessToken(null);

    // Extract locale from current pathname and preserve it
    const segments = pathname.split("/");
    const locale = segments[1] || "ko";
    router.push(getLocalePath(locale, ROUTES.LOGIN));
  }, [setAccessToken, router, pathname]);

  const isAuthenticated = useCallback(() => {
    return !!accessToken;
  }, [accessToken]);

  const requireAuth = useCallback(() => {
    if (!accessToken) {
      // Extract locale from current pathname
      const segments = pathname.split("/");
      const locale = segments[1] || "ko";
      router.push(getLocalePath(locale, ROUTES.LOGIN));
      return false;
    }
    return true;
  }, [accessToken, router, pathname]);

  return {
    accessToken,
    setAccessToken,
    login,
    logout,
    isAuthenticated,
    requireAuth,
  };
}
