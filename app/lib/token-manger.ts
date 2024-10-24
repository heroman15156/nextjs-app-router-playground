import { AuthTokens } from "@/app/types/auth";

class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  clearAccessToken() {
    this.accessToken = null;
  }

  // AuthTokens 타입때문에 setTokens는 유지하되, 리프레시 토큰은 무시
  setTokens(tokens: AuthTokens) {
    this.setAccessToken(tokens.accessToken);
    // 리프레시 토큰은 서버에서 쿠키로 자동 설정됨
  }

  clearTokens() {
    this.clearAccessToken();
    // 리프레시 토큰은 서버에서 쿠키로 자동 제거됨
  }
}

export const tokenManager = TokenManager.getInstance();
