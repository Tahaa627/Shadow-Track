import api from "@/services/api";
import { authStorage } from "@/services/auth";
import type {
  LoginRequest,
  LoginResponse,
} from "../types";

export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login/",
    data
  );

  authStorage.setTokens(
    response.data.access,
    response.data.refresh
  );

  return response.data;
};