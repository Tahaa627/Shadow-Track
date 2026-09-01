import { authStorage } from "@/services/auth";

export const logoutUser = (): void => {
  authStorage.clearTokens();
};

export const logout = logoutUser;