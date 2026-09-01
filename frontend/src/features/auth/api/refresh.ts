import { authStorage } from "@/services/auth";

import type { AuthTokens } from "../types";

interface RefreshResponse {
  access: string;
}

export const refreshToken = async (): Promise<AuthTokens> => {
  const refreshTokenValue = authStorage.getRefreshToken();

  if (!refreshTokenValue) {
    throw new Error("No refresh token available.");
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000/api";

  const response = await fetch(
    `${baseUrl}/auth/refresh/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ refresh: refreshTokenValue }),
    },
  );

  const data = (await response.json().catch(() => null)) as RefreshResponse | null;

  if (!response.ok || !data?.access) {
    authStorage.clearTokens();
    throw new Error("Session expired.");
  }

  authStorage.setTokens(data.access, refreshTokenValue);

  return {
    access: data.access,
    refresh: refreshTokenValue,
  };
};
