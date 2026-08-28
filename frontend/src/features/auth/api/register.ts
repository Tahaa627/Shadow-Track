import api from "@/services/api";
import type { RegisterRequest, User } from "../types";

export const register = async (
  data: RegisterRequest
): Promise<User> => {
  const response = await api.post<User>(
    "/auth/register/",
    data
  );

  return response.data;
};