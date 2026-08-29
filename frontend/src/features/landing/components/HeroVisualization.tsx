import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  CircleAlert,
  Cloud,
  CreditCard,
  Database,
  ShieldCheck,
} from "lucide-react";

const findings = [
  {
    name: "Cloud infrastructure",
    provider: "AWS",
    amount: "$18,420",
    status: "Optimized",
    trend: "+14.8%",
    positive: true,
    icon: Cloud,
  },
  {
    name: "AI subscriptions",
    provider: "External vendors",
    amount: "$9,280",
    status: "Review",
    trend: "-8.2%",
    positive: false,
    icon: BrainCircuit,
  },
  {
    name: "Unmanaged services",
    provider: "Detected",
    amount: "$15,150",
    status: "Attention",
    trend: "-4.1%",
    positive: false,
    icon: CircleAlert,
  },
];

export default function HeroVisualization() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-2xl shadow-black/30">

      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <ShieldCheck
              size={17}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              ShadowAudit
            </p>

            <p className="mt-0.5 text-sm font-medium text-[var(--color-text-primary)]">
              Expense Reconciliation
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-md border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 px-3 py-1.5 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
          <span className="font-mono text-[10px] text-[var(--color-success)]">
            LIVE ANALYSIS
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 border-b border-[var(--color-border)] sm:grid-cols-4">
        <Metric
          label="Identified Spend"
          value="$128.4K"
        />

        <Metric
          label="Optimization"
          value="$42.8K"
          accent
        />

        <Metric
          label="Findings"
          value="24"
        />

        <Metric
          label="Risk Signals"
          value="07"
          warning
        />
      </div>

      {/* Findings */}
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Recent findings
            </p>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Automated analysis across connected services
            </p>
          </div>

          <CreditCard
            size={18}
            strokeWidth={1.6}
            className="text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
        </div>

        <div className="space-y-2">
          {findings.map((finding) => {
            const Icon = finding.icon;

            return (
              <div
                key={finding.name}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 sm:grid-cols-[auto_1fr_auto_auto]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-neutral)] text-[var(--color-secondary)]">
                  <Icon
                    size={16}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">
                    {finding.name}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-[var(--color-text-muted)]">
                    {finding.provider}
                  </p>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="font-mono text-xs text-[var(--color-text-primary)]">
                    {finding.amount}
                  </p>

                  <p
                    className={`mt-0.5 flex items-center justify-end gap-1 font-mono text-[10px] ${
                      finding.positive
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-danger)]"
                    }`}
                  >
                    {finding.positive ? (
                      <ArrowUpRight size={11} />
                    ) : (
                      <ArrowDownRight size={11} />
                    )}

                    {finding.trend}
                  </p>
                </div>

                <span
                  className={`rounded border px-2 py-1 font-mono text-[9px] ${
                    finding.positive
                      ? "border-[var(--color-success)]/20 bg-[var(--color-success)]/5 text-[var(--color-success)]"
                      : "border-[var(--color-warning)]/20 bg-[var(--color-warning)]/5 text-[var(--color-warning)]"
                  }`}
                >
                  {finding.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom insight */}
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--color-primary)]/15 bg-[var(--color-primary)]/5 p-3">
          <Database
            size={16}
            strokeWidth={1.6}
            className="shrink-0 text-[var(--color-primary)]"
            aria-hidden="true"
          />

          <p className="text-[11px] leading-5 text-[var(--color-text-secondary)]">
            Analysis identified{" "}
            <span className="font-semibold text-[var(--color-primary)]">
              $42,850
            </span>{" "}
            in potential annual optimization opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent = false,
  warning = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="border-r border-[var(--color-border)] p-4 last:border-r-0 sm:p-5">
      <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </p>

      <p
        className={`mt-2 font-mono text-lg ${
          accent
            ? "text-[var(--color-primary)]"
            : warning
              ? "text-[var(--color-warning)]"
              : "text-[var(--color-text-primary)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}