import { apiRequest } from "@/services/api";

import type {
  LoginRequest,
  LoginResponse,
} from "../types";

export const login = async (
  data: LoginRequest,
): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>(
    "/auth/login/",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
};