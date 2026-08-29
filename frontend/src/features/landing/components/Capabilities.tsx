import {
  BrainCircuit,
  FileSearch,
  Gauge,
  ReceiptText,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";

const capabilities = [
  {
    icon: ScanSearch,
    number: "01",
    title: "Shadow IT Discovery",
    description:
      "Identify technology operating across your organization before it becomes an unmanaged security or financial risk.",
    accent: "primary",
  },
  {
    icon: ReceiptText,
    number: "02",
    title: "Expense Reconciliation",
    description:
      "Connect technology spend with organizational activity to expose duplicated, unused, and unexpected expenses.",
    accent: "secondary",
  },
  {
    icon: BrainCircuit,
    number: "03",
    title: "AI-Assisted Analysis",
    description:
      "Surface patterns and optimization opportunities across technology usage without replacing human oversight.",
    accent: "tertiary",
  },
  {
    icon: ShieldCheck,
    number: "04",
    title: "Risk Monitoring",
    description:
      "Continuously identify signals that may require attention across services, accounts, and organizational activity.",
    accent: "primary",
  },
  {
    icon: Gauge,
    number: "05",
    title: "Technology Optimization",
    description:
      "Turn discovered technology data into actionable opportunities for reducing waste and improving visibility.",
    accent: "tertiary",
  },
  {
    icon: FileSearch,
    number: "06",
    title: "Audit Intelligence",
    description:
      "Create a structured view of technology activity that makes investigation, review, and compliance workflows easier.",
    accent: "secondary",
  },
];

const accentStyles = {
  primary:
    "border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 text-[var(--color-primary)]",
  secondary:
    "border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5 text-[var(--color-secondary)]",
  tertiary:
    "border-[var(--color-tertiary)]/20 bg-[var(--color-tertiary)]/5 text-[var(--color-tertiary)]",
};

export default function Capabilities() {
  return (
    <section
      id="capabilities"
      className="border-b border-[var(--color-border)] bg-[var(--color-neutral)]"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        {/* Section heading */}
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-primary)]">
            Intelligence Layer
          </p>

          <h2 className="mt-4 font-[var(--font-display)] text-4xl leading-tight text-[var(--color-text-primary)] sm:text-5xl">
            Understand what is
            <span className="text-[var(--color-primary)]">
              {" "}happening beneath the surface.
            </span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
            ShadowAudit brings discovery, financial intelligence,
            optimization, and risk monitoring into one operational
            layer.
          </p>
        </div>

        {/* Capability grid */}
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-border)] md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability) => {
            const Icon = capability.icon;

            return (
              <article
                key={capability.number}
                className="group bg-[var(--color-surface)] p-6 transition-colors duration-200 hover:bg-[var(--color-surface-elevated)] sm:p-7"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-md border ${
                      accentStyles[
                        capability.accent as keyof typeof accentStyles
                      ]
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </div>

                  <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                    /{capability.number}
                  </span>
                </div>

                <h3 className="mt-7 text-base font-medium text-[var(--color-text-primary)]">
                  {capability.title}
                </h3>

                <p className="mt-3 text-xs leading-6 text-[var(--color-text-muted)]">
                  {capability.description}
                </p>

                <div className="mt-6 h-px w-8 bg-[var(--color-border-strong)] transition-all duration-300 group-hover:w-14 group-hover:bg-[var(--color-primary)]" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}