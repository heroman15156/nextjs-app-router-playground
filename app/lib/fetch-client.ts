// lib/api/fetch-client.ts

import { tokenManager } from "@/app/lib/token-manger";
import { authEvents } from "@/app/lib/events/auth-events";

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

interface ApiResponse<T = unknown> {
  data: T;
  error?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseURL: string;
  private tokenManager: typeof tokenManager;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.tokenManager = tokenManager;
  }

  private async handleTokenExpiration() {
    this.tokenManager.clearTokens();
    authEvents.emit("sessionExpired");
  }

  private async refreshToken() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!refreshResponse.ok) {
          throw new Error("Token refresh failed");
        }

        const data = await refreshResponse.json();
        this.tokenManager.setAccessToken(data.tokens.accessToken);
      } catch (error) {
        await this.handleTokenExpiration();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async handleResponse<T>(
    response: Response,
    retryRequest: () => Promise<Response>,
  ): Promise<T> {
    if (response.ok) {
      const data: T = await response.json();
      return data;
    }

    if (response.status === 401) {
      try {
        await this.refreshToken();
        const newResponse = await retryRequest();
        return this.handleResponse<T>(newResponse, retryRequest);
      } catch (error) {
        throw new ApiError(401, "Authentication failed");
      }
    }

    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new ApiError(response.status, errorData.message || "Request failed");
  }

  private createUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {},
  ): Promise<T> {
    const makeRequest = async (): Promise<Response> => {
      const headers = new Headers(options.headers);
      const accessToken = this.tokenManager.getAccessToken();

      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      return fetch(this.createUrl(endpoint, options.params), {
        ...options,
        headers,
        credentials: "include",
      });
    };

    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }

  async get<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: FetchOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: FetchOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options: FetchOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL!);
