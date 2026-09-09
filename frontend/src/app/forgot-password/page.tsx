import Link from "next/link";

import {
  AuthLayout,
} from "@/features/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Password recovery"
      description="Contact your organization administrator to reset access to your ShadowAudit workspace."
    >
      <Link
        href="/login"
        className="inline-flex rounded-md border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        Return to sign in
      </Link>
    </AuthLayout>
  );
}