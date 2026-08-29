import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export default function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[var(--color-neutral)]">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        {/* Brand panel */}
        <section className="hidden border-r border-[var(--color-border)] lg:flex lg:flex-col lg:justify-between lg:p-12">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]">
              <ShieldCheck
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </span>

            <span className="font-mono text-sm font-semibold tracking-[0.18em] text-[var(--color-text-primary)]">
              SHADOW
              <span className="text-[var(--color-primary)]">
                AUDIT
              </span>
            </span>
          </Link>

          <div className="max-w-md">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-primary)]">
              Secure Access
            </p>

            <h1 className="mt-4 font-[var(--font-display)] text-5xl leading-tight text-[var(--color-text-primary)]">
              Sovereign visibility starts here.
            </h1>

            <p className="mt-5 text-sm leading-7 text-[var(--color-text-muted)]">
              Access the ShadowAudit intelligence layer and
              bring technology spend, usage, and organizational
              risk into view.
            </p>
          </div>

          <p className="font-mono text-[10px] text-[var(--color-text-muted)]">
            SECURITY-FIRST APPLICATION
          </p>
        </section>

        {/* Form panel */}
        <section className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2"
              >
                <ShieldCheck
                  size={19}
                  className="text-[var(--color-primary)]"
                  aria-hidden="true"
                />

                <span className="font-mono text-sm font-semibold tracking-[0.16em]">
                  SHADOWAUDIT
                </span>
              </Link>
            </div>

            <div>
              <h2 className="font-[var(--font-display)] text-4xl text-[var(--color-text-primary)]">
                {title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                {description}
              </p>
            </div>

            <div className="mt-8">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}