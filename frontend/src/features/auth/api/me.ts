import {apiRequest} from "@/services/api";
import type { User } from "../types";

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiRequest<User>(
    "/auth/me/",
    {
      method: "GET",
    },
  );

  return response;
};