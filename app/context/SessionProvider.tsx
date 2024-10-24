"use client";
import React, { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { authEvents } from "@/app/lib/events/auth-events";

function AuthEventsHandler() {
  const { logout } = useAuth();

  useEffect(() => {
    const handleSessionExpired = () => {
      alert({
        title: "세션 만료",
        description: "다시 로그인해 주세요.",
        variant: "default",
      });
      logout();
    };

    authEvents.on("sessionExpired", handleSessionExpired);
    return () => {
      authEvents.off("sessionExpired", handleSessionExpired);
    };
  }, [logout]);

  return null;
}

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
