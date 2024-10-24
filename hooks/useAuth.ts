"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect } from "react";
import { tokenManager } from "@/app/lib/token-manger";
import { usePathname } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const { data: session } = useSession();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  const handleLogout = useCallback(async () => {
    try {
      tokenManager.clearTokens();
      await signOut({ redirect: false });
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [router]);

  useEffect(() => {
    if (isLoginPage && session) {
      router.push("/dashboard");
    }
  }, [isLoginPage, session, router]);

  return {
    session,
    logout: handleLogout,
    isAuthenticated: !!session,
  };
}
