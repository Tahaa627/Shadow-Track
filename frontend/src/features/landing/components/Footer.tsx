import Link from "next/link";
import {
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

const navigation = [
  {
    title: "Product",
    links: [
      { label: "Capabilities", href: "#capabilities" },
      { label: "Security", href: "#security" },
    ],
  },
  {
    title: "Access",
    links: [
      { label: "Request Access", href: "/register" },
      { label: "Sign In", href: "/login" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--color-neutral)]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]">
                <ShieldCheck
                  size={17}
                  strokeWidth={1.8}
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

            <p className="mt-5 max-w-sm text-xs leading-6 text-[var(--color-text-muted)]">
              Sovereign visibility into technology spend,
              shadow IT, and organizational risk.
            </p>
          </div>

          {/* Navigation */}
          {navigation.map((group) => (
            <div key={group.title}>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                {group.title}
              </p>

              <div className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} ShadowAudit. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            >
              Terms
            </Link>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ShadowAudit GitHub"
              className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
            >
            </a>

            <Link
              href="#"
              aria-label="Back to top"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            >
              <ArrowUpRight
                size={15}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}