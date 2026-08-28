import api from "@/services/api";
import type { User } from "../types";

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>("/auth/me/");

  return response.data;
};