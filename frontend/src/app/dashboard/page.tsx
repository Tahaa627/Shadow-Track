"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[var(--color-neutral)] p-8">
        <h1 className="text-3xl text-[var(--color-text-primary)]">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Authentication successful.
        </p>
      </main>
    </ProtectedRoute>
  );
}