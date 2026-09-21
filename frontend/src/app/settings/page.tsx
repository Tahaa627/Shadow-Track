"use client";

import { useEffect, useState, type FormEvent } from "react";

import ProtectedRoute from "@/components/ProtectedRoute";
import { updateCurrentUser, getCurrentUser } from "@/features/auth/api/me";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { refreshUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await getCurrentUser();
        setFirstName(user.first_name ?? "");
        setLastName(user.last_name ?? "");
        setEmail(user.email ?? "");
      } catch {
        setStatus("Unable to load your profile right now.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      const payload: {
        first_name?: string;
        last_name?: string;
        email?: string;
        current_password?: string;
        new_password?: string;
      } = {
        first_name: firstName,
        last_name: lastName,
        email,
      };

      if (currentPassword || newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      await updateCurrentUser(payload);
      await refreshUser();
      setCurrentPassword("");
      setNewPassword("");
      setStatus("Profile updated successfully.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update profile.";
      setStatus(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#0a0d14] px-5 py-16 text-[#f3f4f6] sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f2ca50]">Account</p>
            <h1 className="mt-3 text-3xl font-bold text-[#f3f4f6]">Settings</h1>
            <p className="mt-2 text-sm text-[#9ba1ad]">
              Manage your profile details and update your password.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-[#212938] bg-[#11141d] p-6 shadow-[0_0_0_1px_rgba(33,41,56,0.6)]"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm text-[#dfe3ea]">
                <span>First name</span>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-md border border-[#384357] bg-[#0d1117] px-3 py-2.5 text-[#f3f4f6] outline-none transition focus:border-[#f2ca50]"
                  placeholder="Jane"
                  disabled={isLoading}
                />
              </label>

              <label className="space-y-2 text-sm text-[#dfe3ea]">
                <span>Last name</span>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-md border border-[#384357] bg-[#0d1117] px-3 py-2.5 text-[#f3f4f6] outline-none transition focus:border-[#f2ca50]"
                  placeholder="Doe"
                  disabled={isLoading}
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm text-[#dfe3ea]">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-md border border-[#384357] bg-[#0d1117] px-3 py-2.5 text-[#f3f4f6] outline-none transition focus:border-[#f2ca50]"
                placeholder="name@example.com"
                disabled={isLoading}
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm text-[#dfe3ea]">
                <span>Current password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full rounded-md border border-[#384357] bg-[#0d1117] px-3 py-2.5 text-[#f3f4f6] outline-none transition focus:border-[#f2ca50]"
                  placeholder="••••••••"
                />
              </label>

              <label className="space-y-2 text-sm text-[#dfe3ea]">
                <span>New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-md border border-[#384357] bg-[#0d1117] px-3 py-2.5 text-[#f3f4f6] outline-none transition focus:border-[#f2ca50]"
                  placeholder="At least 8 characters"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#212938] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-6 text-sm text-[#9ba1ad]">
                {status && <span>{status}</span>}
              </div>

              <button
                type="submit"
                disabled={isLoading || isSaving}
                className="rounded-md bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#241a00] transition hover:bg-[#e2c45a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}