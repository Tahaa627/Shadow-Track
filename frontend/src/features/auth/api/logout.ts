import { authStorage } from "@/services/auth";

export const logout = (): void => {
  authStorage.clearTokens();
};