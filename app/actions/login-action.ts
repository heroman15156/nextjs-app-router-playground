"use server";
import { revalidatePath } from "next/cache";

export interface LoginCredentials {
  email: string;
  password: string;
}

class AuthError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
export async function loginAction(credentials: LoginCredentials) {
  try {
    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AuthError(
        response.status,
        data.message,
        data, // 추가 데이터가 있다면 전달
      );
    }

    return data;
  } catch (error) {
    console.log("Login Error:", error);
    if (error instanceof AuthError) {
      throw error; // AuthError는 그대로 전달
    }
    // 예상치 못한 에러는 일반 에러로 변환
    throw new Error("알 수 없는 에러가 발생했습니다.");
  }
}

export async function refreshTokenAction(refreshToken: string) {
  const response = await fetch(`http://localhost:8080/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  return response.json();
}
