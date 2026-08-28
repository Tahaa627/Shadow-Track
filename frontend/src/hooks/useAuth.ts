"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
} from "@/features/auth";

import type {
  LoginRequest,
  LoginResponse,
  User,
} from "@/features/auth/types";

import { authStorage } from "@/services/auth";

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = authStorage.getAccessToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      authStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (
    data: LoginRequest
  ): Promise<LoginResponse> => {
    const response = await loginApi(data);

    await refreshUser();

    return response;
  };

  const logout = (): void => {
    logoutApi();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    refreshUser,
  };
}