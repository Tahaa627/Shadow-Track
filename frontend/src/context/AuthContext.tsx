"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "@/features/auth";
import { authStorage } from "@/services/auth";

import type { User } from "@/features/auth/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(
    null,
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const refreshUser = useCallback(async () => {
    const accessToken =
      authStorage.getAccessToken();

    if (!accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser =
        await getCurrentUser();

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

  const logout = useCallback(() => {
    authStorage.clearTokens();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      logout,
      refreshUser,
    }),
    [
      user,
      isLoading,
      logout,
      refreshUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used inside AuthProvider.",
    );
  }

  return context;
}