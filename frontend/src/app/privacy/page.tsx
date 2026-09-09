import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--color-neutral)] px-5 py-16 text-[var(--color-text-primary)] sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">Privacy</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl">Privacy policy</h1>
        <p className="mt-5 text-sm leading-7 text-[var(--color-text-muted)]">Privacy policy details will be published here.</p>
        <Link href="/" className="mt-8 inline-flex text-sm text-[var(--color-primary)] hover:underline">Return home</Link>
      </div>
    </main>
  );
}