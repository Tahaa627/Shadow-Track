import Button from "@/components/Button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-neutral)] p-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <div>
          <p className="font-mono text-sm text-[var(--color-primary)]">
            SHADOWAUDIT
          </p>

          <h1 className="mt-3 font-[var(--font-display)] text-6xl text-[var(--color-text-primary)]">
            Sovereign Visibility
          </h1>

          <p className="mt-4 max-w-xl text-[var(--color-text-muted)]">
            Reconcile expenses, optimize technology spend,
            and monitor organizational risk.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button variant="primary">
            Request Access
          </Button>

          <Button variant="outlined">
            View Demo
          </Button>

          <Button variant="tertiary">
            Analyze
          </Button>

          <Button variant="ghost">
            Learn More
          </Button>
        </div>
      </div>
    </main>
  );
}