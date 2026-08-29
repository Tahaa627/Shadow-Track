import { apiRequest } from "@/services/api";

import type {
  RegisterRequest,
  RegisterResponse,
} from "../types";

export async function registerUser(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>(
    "/auth/register/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}