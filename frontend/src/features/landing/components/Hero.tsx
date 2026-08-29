import Link from "next/link";
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import Button from "@/components/Button";
import HeroVisualization from "./HeroVisualization";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]">
      {/* Background grid */}
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

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[var(--color-primary)]/5 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:pb-32 lg:pt-32">
        <div className="mx-auto max-w-4xl text-center">

          {/* Eyebrow */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/5 px-3 py-1.5">
            <ShieldCheck
              size={14}
              strokeWidth={1.8}
              className="text-[var(--color-primary)]"
              aria-hidden="true"
            />

            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Early Access Available
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-[var(--font-display)] text-5xl leading-[0.95] tracking-tight text-[var(--color-text-primary)] sm:text-6xl md:text-7xl lg:text-8xl">
            Sovereign Visibility
            <span className="block text-[var(--color-primary)]">
              into Shadow IT
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[var(--color-text-muted)] sm:text-lg sm:leading-8">
            Reconcile expenses. Optimize technology spend.
            Monitor organizational risk. ShadowAudit gives
            security and finance teams a unified view of the
            technology operating beneath the surface.
          </p>

          {/* CTAs */}
          <div
            id="request-access"
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href="/register">
              <Button
                variant="primary"
                size="lg"
              >
                Request Access
                <ArrowRight
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </Button>
            </Link>

            <Link href="#product-preview">
              <Button
                variant="outlined"
                size="lg"
              >
                <Play
                  size={15}
                  strokeWidth={1.8}
                  fill="currentColor"
                  aria-hidden="true"
                />
                View Product
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
              Organization isolated
            </span>

            <span className="hidden h-3 w-px bg-[var(--color-border)] sm:block" />

            <span className="flex items-center gap-2">
              <ShieldCheck
                size={13}
                strokeWidth={1.7}
                className="text-[var(--color-secondary)]"
                aria-hidden="true"
              />
              Privacy-first architecture
            </span>

            <span className="hidden h-3 w-px bg-[var(--color-border)] sm:block" />

            <span className="flex items-center gap-2">
              <Sparkles
                size={13}
                strokeWidth={1.7}
                className="text-[var(--color-tertiary)]"
                aria-hidden="true"
              />
              AI-assisted analysis
            </span>
          </div>
        </div>

        {/* Product visualization */}
        <div
          id="product-preview"
          className="mx-auto mt-16 max-w-6xl sm:mt-20"
        >
          <HeroVisualization />
        </div>
      </div>
    </section>
  );
}