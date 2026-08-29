import Link from "next/link";
import {
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import Button from "@/components/Button";

export default function FinalCTA() {
  return (
    <section
      id="request-access"
      className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-neutral)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              currentColor 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              currentColor 1px,
              transparent 1px
            )
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-primary)]/5 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/5 text-[var(--color-primary)]">
          <LockKeyhole
            size={21}
            strokeWidth={1.7}
            aria-hidden="true"
          />
        </div>

        <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Take Control
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl font-[var(--font-display)] text-4xl leading-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
          Bring the technology
          <span className="text-[var(--color-primary)]">
            {" "}beneath the surface{" "}
          </span>
          into view.
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
          Build a clearer picture of technology spend, usage,
          and organizational risk with ShadowAudit.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button variant="primary" size="lg">
              Request Access
              <ArrowRight
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </Button>
          </Link>

          <Link href="/login">
            <Button variant="outlined" size="lg">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-[var(--color-text-muted)]">
          <ShieldCheck
            size={13}
            strokeWidth={1.7}
            className="text-[var(--color-success)]"
            aria-hidden="true"
          />

          Security-conscious architecture
        </div>
      </div>
    </section>
  );
}