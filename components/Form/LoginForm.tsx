// components/auth/LoginForm.tsx
"use client";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// 컴포넌트에서
export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  const [error, setError] = useState("");
  const callbackUrl = useMemo(() => {
    return searchParams.get("callbackUrl") || "/dashboard";
  }, [searchParams]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      try {
        startTransition(async () => {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl,
          });

          if (result?.error) {
            try {
              const errorData = JSON.parse(result.error);
              // 한 번만 로그 출력
              console.log("Auth Error:", {
                status: errorData.statusCode,
                message: errorData.message,
              });

              // 상태 코드별 처리
              switch (errorData.statusCode) {
                case 404:
                  setError("사용자를 찾을 수 없습니다.");
                  break;
                case 401:
                  setError("비밀번호가 올바르지 않습니다.");
                  break;
                default:
                  setError(errorData.message);
              }
            } catch {
              setError(result.error);
            }
          } else if (result?.ok) {
            router.push(callbackUrl);
            router.refresh();
          }
        });
      } catch (error) {
        console.error("Login error:", error);
        // setError("로그인 중 오류가 발생했습니다.");
      }
    },
    [router, callbackUrl],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <h1>{error}</h1>}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
