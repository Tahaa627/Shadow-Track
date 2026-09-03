interface KpiCardProps {
  label: string;
  value: string;
}

export default function KpiCard({ label, value }: KpiCardProps) {
  return (
    <article className="border border-[#212938] bg-[#11141d] p-5 transition hover:border-[#384357]">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9ba1ad]">
        {label}
      </p>
      <p className="mt-5 font-[Newsreader,serif] text-3xl text-[#f3f4f6] sm:text-4xl">
        {value}
      </p>
    </article>
  );
}