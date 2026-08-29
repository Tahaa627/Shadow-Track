// src/services/api.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

interface ApiRequestOptions extends RequestInit {
  body?: BodyInit | null;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data ?? { detail: "Something went wrong." },
      response.status,
    );
  }

  return data as T;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(data: unknown, status: number) {
    super("API request failed");
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}