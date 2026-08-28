"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X } from "lucide-react";
import Button from "@/components/Button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-neutral)]/90 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex items-center gap-2"
          aria-label="ShadowAudit home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-primary)] text-[var(--color-primary)]">
            <ShieldCheck size={17}strokeWidth={1.8}aria-hidden="true"/>
          </span>

          <span className="font-mono text-sm font-semibold tracking-[0.18em] text-[var(--color-text-primary)]">
            SHADOW
            <span className="text-[var(--color-primary)]">
              AUDIT
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#capabilities"
            className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
          >
            Capabilities
          </Link>

          <Link
            href="#security"
            className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
          >
            Security
          </Link>

          <Link
            href="/login"
            className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
          >
            Login
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              document
                .getElementById("request-access")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            Request Access
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-primary)] md:hidden"
          aria-label={
            isOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="text-lg">
            {isOpen ? (
            <X size={19} strokeWidth={1.8} aria-hidden="true" />
            ) : (
            <Menu size={19} strokeWidth={1.8} aria-hidden="true" />
            )}
          </span>
        </button>
      </nav>

      {/* Mobile navigation */}
      {isOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-5 py-4 sm:px-8">
            <Link
              href="#capabilities"
              onClick={closeMenu}
              className="border-b border-[var(--color-border)] py-4 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              Capabilities
            </Link>

            <Link
              href="#security"
              onClick={closeMenu}
              className="border-b border-[var(--color-border)] py-4 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              Security
            </Link>

            <Link
              href="/login"
              onClick={closeMenu}
              className="border-b border-[var(--color-border)] py-4 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              Login
            </Link>

            <div className="pt-4">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  closeMenu();

                  document
                    .getElementById("request-access")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                Request Access
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}