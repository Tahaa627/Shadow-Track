"use client";

import { useEffect, useState, type FormEvent } from "react";

import ProtectedRoute from "@/components/ProtectedRoute";
import { updateCurrentUser, getCurrentUser } from "@/features/auth/api/me";
import { getOrganizationUsers } from "@/features/auth/api/users";
import { useAuth } from "@/hooks/useAuth";

import type { User } from "@/features/auth/types";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [currentUser, members] = await Promise.all([
          getCurrentUser(),
          getOrganizationUsers(),
        ]);

        setFirstName(currentUser.first_name ?? "");
        setLastName(currentUser.last_name ?? "");
        setEmail(currentUser.email ?? "");
        setTeamMembers(members);
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

  const organizationName = user?.organization?.name ?? "Your organization";

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#0a0d14] px-5 py-16 text-[#f3f4f6] sm:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f2ca50]">Account</p>
            <h1 className="mt-3 text-3xl font-bold text-[#f3f4f6]">Settings</h1>
            <p className="mt-2 text-sm text-[#9ba1ad]">
              Manage your account, workspace profile, and your organization team.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-[#212938] bg-[#11141d] p-6 shadow-[0_0_0_1px_rgba(33,41,56,0.6)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#212938] pb-4">
              <div>
                <h2 className="text-lg font-semibold text-[#f3f4f6]">Profile</h2>
                <p className="text-sm text-[#9ba1ad]">Update your personal details.</p>
              </div>
              <div className="rounded-full border border-[#384357] bg-[#0d1117] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#f2ca50]">
                {organizationName}
              </div>
            </div>

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

          <section className="rounded-2xl border border-[#212938] bg-[#11141d] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#f3f4f6]">Organization team</h2>
                <p className="text-sm text-[#9ba1ad]">Members in {organizationName}</p>
              </div>
              <span className="rounded-full border border-[#384357] bg-[#0d1117] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#9ba1ad]">
                {teamMembers.length} members
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#212938]">
              <div className="grid grid-cols-[minmax(0,1.25fr)_120px_120px] bg-[#0d1117] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9ba1ad]">
                <span>Name</span>
                <span>Role</span>
                <span>Email</span>
              </div>

              {teamMembers.length === 0 ? (
                <div className="px-4 py-5 text-sm text-[#9ba1ad]">No team members found.</div>
              ) : (
                teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-[minmax(0,1.25fr)_120px_120px] items-center gap-2 border-t border-[#212938] px-4 py-3 text-sm text-[#f3f4f6]"
                  >
                    <div>
                      <div className="font-medium text-[#f3f4f6]">
                        {[member.first_name, member.last_name].filter(Boolean).join(" ") || "Unnamed user"}
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex rounded-full border border-[#384357] bg-[#191c26] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#f2ca50]">
                        {member.role}
                      </span>
                    </div>
                    <div className="text-[#9ba1ad]">{member.email}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}