import {
  Database,
  Fingerprint,
  LockKeyhole,
  Server,
  ShieldCheck,
} from "lucide-react";

const principles = [
  {
    icon: LockKeyhole,
    title: "Least-privilege thinking",
    description:
      "Access should be limited to what a workflow actually requires.",
  },
  {
    icon: Database,
    title: "Organization isolation",
    description:
      "Organizational data is treated as a separate security boundary.",
  },
  {
    icon: Fingerprint,
    title: "Identity-aware access",
    description:
      "Authenticated users interact with resources according to their assigned permissions.",
  },
  {
    icon: Server,
    title: "Controlled data flow",
    description:
      "Sensitive application data moves through defined application and API layers.",
  },
];

export default function SecuritySection() {
  return (
    <section
      id="security"
      className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          {/* Left */}
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 text-[var(--color-primary)]">
              <ShieldCheck
                size={21}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>

            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-primary)]">
              Security by Design
            </p>

            <h2 className="mt-4 font-[var(--font-display)] text-4xl leading-tight text-[var(--color-text-primary)] sm:text-5xl">
              Visibility should never
              <span className="block text-[var(--color-primary)]">
                compromise control.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
              ShadowAudit is being built around explicit identity,
              organizational boundaries, permission-aware APIs, and
              controlled access to sensitive information.
            </p>
          </div>

          {/* Principles */}
          <div className="grid gap-3 sm:grid-cols-2">
            {principles.map((principle) => {
              const Icon = principle.icon;

              return (
                <article
                  key={principle.title}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-neutral)] p-5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border-strong)] text-[var(--color-secondary)]">
                    <Icon
                      size={17}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mt-5 text-sm font-medium text-[var(--color-text-primary)]">
                    {principle.title}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-[var(--color-text-muted)]">
                    {principle.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}