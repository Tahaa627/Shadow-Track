import { apiRequest } from "@/services/api";

import type { User } from "../types";

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/me/", {
    method: "GET",
  });
}