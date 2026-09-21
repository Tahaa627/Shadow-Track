import { apiRequest } from "@/services/api";

import type { User } from "../types";

export async function getOrganizationUsers(): Promise<User[]> {
  return apiRequest<User[]>("/auth/users/");
}
