import { apiRequest } from "@/services/api";

import type { User } from "../types";

export interface UpdateCurrentUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/me/", {
    method: "GET",
  });
}

export async function updateCurrentUser(
  payload: UpdateCurrentUserPayload,
): Promise<User> {
  return apiRequest<User>("/auth/me/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}