import { apiRequest } from "@/services/api";

import type {
  LoginRequest,
  LoginResponse,
} from "../types";

export async function loginUser(
  payload: LoginRequest,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(
    "/auth/login/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}