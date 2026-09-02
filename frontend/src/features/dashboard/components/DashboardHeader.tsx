import { Download } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="flex flex-col gap-6 border-b border-[#212938] pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-[Newsreader,serif] text-4xl leading-tight tracking-[-0.02em] text-[#f3f4f6] sm:text-5xl">
          Q3 Compliance Overview
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#9ba1ad]">
          <span
            className="h-2 w-2 rounded-full bg-[#34d399]"
            aria-hidden="true"
          />
          <span>Live Telemetry Active</span>
          <span aria-hidden="true">•</span>
          <span>Last sync: 2 mins ago</span>
        </p>
      </div>

      <button
        type="button"
        className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md border border-[#384357] bg-[#191c26] px-4 py-2 text-sm font-semibold text-[#f3f4f6] transition hover:border-[#f2ca50] hover:text-[#f2ca50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2ca50]/60"
      >
        <Download size={16} aria-hidden="true" />
        Export CSV
      </button>
    </header>
  );
}
