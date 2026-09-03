interface KpiCardProps {
  label: string;
  value: string;
  detail: string;
  detailClass: string;
  accent: string;
  icon: string;
}

export default function KpiCard({ label, value, detail, detailClass, accent, icon }: KpiCardProps) {
  return (
    <article className={`min-h-[90px] border-l-2 border-r border-y border-[#212938] bg-[#11141d] px-3 py-3 transition hover:border-[#384357] ${accent}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-[#9ba1ad]">{label}</p>
        <span className="text-[10px] text-[#9ba1ad]" aria-hidden="true">{icon}</span>
      </div>
      <p className="mt-2 font-[Newsreader,serif] text-[21px] leading-none text-[#f3f4f6]">
        {value}
      </p>
      <p className={`mt-2 text-[8px] leading-tight ${detailClass}`}>{detail}</p>
    </article>
  );
}