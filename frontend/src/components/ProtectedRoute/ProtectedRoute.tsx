"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const router = useRouter();

  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [
    isLoading,
    isAuthenticated,
    router,
  ]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-neutral)]">
        <div className="text-center">
          <div
            className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]"
            aria-label="Loading"
          />

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Verifying session
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}