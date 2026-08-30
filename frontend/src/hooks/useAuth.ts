"use client";

import { useCallback, useEffect, useState } from "react";

import { getCurrentUser } from "@/features/auth";
import { authStorage } from "@/services/auth";

import type { User } from "@/features/auth/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadUser = useCallback(async () => {
    const token = authStorage.getAccessToken();

    if (!token) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      return;
    }

    try {
      const user = await getCurrentUser();

      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      authStorage.clearTokens();

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const logout = useCallback(() => {
    authStorage.logout();

    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    window.location.href = "/login";
  }, []);

  return {
    ...state,
    logout,
    refreshUser: loadUser,
  };
}