import { apiRequest } from "@/services/api";
import { authStorage } from "@/services/auth";

import type {
  LoginRequest,
  LoginResponse,
} from "../types";

export async function loginUser(
  payload: LoginRequest,
): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>(
    "/auth/login/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  authStorage.setTokens(
    response.access,
    response.refresh,
  );

  return response;
}