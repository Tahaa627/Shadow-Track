"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Monitor, RefreshCw } from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/features/dashboard/components/DashboardShell";
import {
  createExtensionEnrollment,
  getExtensionEnrollments,
  type ExtensionEnrollment,
} from "@/features/extensions/api/extensionsApi";

const statusStyles = {
  pending: "border-[#6b5311] bg-[#2c2309] text-[#f2ca50]",
  active: "border-[#245e48] bg-[#0d2a20] text-[#6ee7b7]",
  revoked: "border-[#6b2930] bg-[#2c1115] text-[#fca5a5]",
};

function formatDate(value: string | null) {
  if (!value) return "Not yet connected";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ExtensionPage() {
  const [enrollment, setEnrollment] = useState<ExtensionEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function loadEnrollments() {
    try {
      setError("");
      const data = await getExtensionEnrollments();
      setEnrollment(data[0] ?? null);
    } catch (err) {
      console.error(err);
      setError("Unable to load extension enrollment.");
    } finally {
      setLoading(false);
    }
  }

  async function generateEnrollment() {
    try {
      setGenerating(true);
      setError("");
      const data = await createExtensionEnrollment();
      setEnrollment(data);
    } catch (err) {
      console.error(err);
      setError("Unable to generate enrollment code.");
    } finally {
      setGenerating(false);
    }
  }

  async function copyCode() {
    if (!enrollment) return;

    await navigator.clipboard.writeText(enrollment.enrollment_code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadEnrollments();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!enrollment || enrollment.status !== "pending") return;

    const interval = window.setInterval(() => {
      void loadEnrollments();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [enrollment]);

  return (
    <ProtectedRoute>
      <DashboardShell>
        <section className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1120px] p-5 sm:p-8">
          <header className="border-b border-[#212938] pb-7">
            <div className="flex items-center gap-3">
              <Monitor className="text-[#f2ca50]" size={25} aria-hidden="true" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ba1ad]">Browser telemetry</p>
                <h1 className="mt-1 font-[Newsreader,serif] text-4xl font-bold text-[#f3f4f6]">Chrome Extension</h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#9ba1ad]">
              Connect employee browsers to ShadowAudit to discover SaaS usage and identify shadow SaaS.
            </p>
          </header>

          {error && (
            <div className="mt-6 border border-[#6b2930] bg-[#2c1115] p-4 text-sm text-[#fca5a5]" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-sm text-[#9ba1ad]">Loading extension status...</div>
          ) : !enrollment ? (
            <section className="mt-8 max-w-2xl border border-[#303441] bg-[#11141d] p-6" aria-labelledby="connect-title">
              <h2 id="connect-title" className="text-lg font-semibold text-[#f3f4f6]">Connect a browser</h2>
              <p className="mt-2 text-sm leading-6 text-[#9ba1ad]">Generate a one-time enrollment code to connect a browser to your organization.</p>
              <button
                type="button"
                onClick={() => void generateEnrollment()}
                disabled={generating}
                className="mt-6 inline-flex items-center gap-2 bg-[#d4af37] px-4 py-3 text-sm font-semibold text-[#241a00] transition hover:bg-[#e2c45a] disabled:cursor-wait disabled:opacity-50"
              >
                {generating && <RefreshCw size={16} className="animate-spin" aria-hidden="true" />}
                Generate Enrollment Code
              </button>
            </section>
          ) : (
            <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
              <section className="border border-[#303441] bg-[#11141d] p-6" aria-labelledby="enrollment-title">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9ba1ad]">Enrollment</p>
                    <h2 id="enrollment-title" className="mt-2 text-xl font-semibold text-[#f3f4f6]">Connect a browser</h2>
                  </div>
                  <span className={`border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusStyles[enrollment.status]}`}>
                    {enrollment.status}
                  </span>
                </div>

                <div className="mt-7 border border-[#303441] bg-[#191c26] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9ba1ad]">Enrollment code</p>
                  <div className="mt-3 flex items-center gap-3">
                    <code className="min-w-0 flex-1 break-all text-sm font-semibold tracking-[0.08em] text-[#f2ca50]">{enrollment.enrollment_code}</code>
                    <button type="button" onClick={() => void copyCode()} className="shrink-0 border border-[#384357] p-2 text-[#c7c9d1] transition hover:border-[#f2ca50] hover:text-[#f2ca50]" title="Copy enrollment code" aria-label="Copy enrollment code">
                      {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#9ba1ad]">This code expires {formatDate(enrollment.expires_at)} and can be used once.</p>
                </div>

                {enrollment.status === "pending" ? (
                  <div className="mt-6 flex items-center gap-3 border-l-2 border-[#f2ca50] bg-[#191c26] px-4 py-3 text-sm text-[#c7c9d1]">
                    <RefreshCw size={16} className="animate-spin text-[#f2ca50]" aria-hidden="true" />
                    Waiting for browser enrollment...
                  </div>
                ) : enrollment.status === "active" ? (
                  <div className="mt-6 flex items-center gap-3 border-l-2 border-[#6ee7b7] bg-[#0d2a20] px-4 py-3 text-sm text-[#c7c9d1]">
                    <Check size={16} className="text-[#6ee7b7]" aria-hidden="true" />
                    Extension connected and reporting.
                  </div>
                ) : null}
              </section>

              <section className="border border-[#303441] bg-[#11141d] p-6" aria-labelledby="installation-title">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9ba1ad]">Setup</p>
                <h2 id="installation-title" className="mt-2 text-xl font-semibold text-[#f3f4f6]">Installation</h2>
                <ol className="mt-6 space-y-5 text-sm">
                  {[
                    ["Install the extension", "Load ShadowAudit in Chrome."],
                    ["Open ShadowAudit", "Open it from Chrome's extensions menu."],
                    ["Enter the code", "Paste the enrollment code above."],
                    ["Enroll the browser", "Click Connect extension."],
                  ].map(([title, detail], index) => (
                    <li key={title} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#384357] text-[10px] font-bold text-[#f2ca50]">{index + 1}</span>
                      <div><strong className="font-semibold text-[#f3f4f6]">{title}</strong><p className="mt-1 leading-5 text-[#9ba1ad]">{detail}</p></div>
                    </li>
                  ))}
                </ol>
                <div className="mt-7 border-t border-[#212938] pt-5 text-xs text-[#9ba1ad]">
                  <span className="text-[#f3f4f6]">Last seen:</span> {formatDate(enrollment.last_seen)}
                </div>
              </section>
            </div>
          )}
        </section>
      </DashboardShell>
    </ProtectedRoute>
  );
}