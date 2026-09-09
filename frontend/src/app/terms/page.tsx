import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-neutral)] px-5 py-16 text-[var(--color-text-primary)] sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">Terms</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl">Terms of service</h1>
        <p className="mt-5 text-sm leading-7 text-[var(--color-text-muted)]">Terms of service details will be published here.</p>
        <Link href="/" className="mt-8 inline-flex text-sm text-[var(--color-primary)] hover:underline">Return home</Link>
      </div>
    </main>
  );
}