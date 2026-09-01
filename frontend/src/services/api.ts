// src/services/api.ts

import { refreshToken } from "@/features/auth/api/refresh";

import { authStorage } from "./auth";
// Define the base URL for the API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";

interface ApiRequestOptions extends RequestInit {
  body?: BodyInit | null;
}

let refreshPromise: Promise<string> | null = null;

function redirectToLogin() {
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;

    if (!pathname.startsWith("/login")) {
      window.location.assign("/login");
    }
  }
}

async function refreshAccessToken(): Promise<string> {
  const { access } = await refreshToken();
  return access;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await makeRequest(
    endpoint,
    options,
    authStorage.getAccessToken(),
  );

  if (response.status === 401) {
    try {
      /*
       * If several requests expire at the same time,
       * they share the same refresh request.
       */
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(
          () => {
            refreshPromise = null;
          },
        );
      }

      const newAccessToken = await refreshPromise;

      const retryResponse = await makeRequest(
        endpoint,
        options,
        newAccessToken,
      );

      return await handleResponse<T>(
        retryResponse,
      );
    } catch {
      handleExpiredSession();

      throw new ApiError(
        { detail: "Your session has expired." },
        401,
      );
    }
  }

  return handleResponse<T>(response);
}

function handleExpiredSession() {
  authStorage.clearTokens();
  redirectToLogin();
}

async function makeRequest(
  endpoint: string,
  options: ApiRequestOptions,
  accessToken: string | null,
): Promise<Response> {
  const headers = new Headers(options.headers);

  headers.set(
    "Content-Type",
    "application/json",
  );

  if (accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }

  return fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
      credentials: "include",
    },
  );
}

async function handleResponse<T>(
  response: Response,
): Promise<T> {
  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data ?? {
        detail: "Something went wrong.",
      },
      response.status,
    );
  }

  return data as T;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(
    data: unknown,
    status: number,
  ) {
    super("API request failed");

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}