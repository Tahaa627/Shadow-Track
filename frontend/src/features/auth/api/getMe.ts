import { apiRequest } from "@/services/api";

import type { CurrentUser } from "../types";

export const getMe = async (): Promise<CurrentUser> => {
  return apiRequest<CurrentUser>("/auth/me/");
};
