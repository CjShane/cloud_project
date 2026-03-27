import type { DailyVerseResult } from "@/lib/api/daily-verse";

type DailyVerseCardProps = {
  data: DailyVerseResult;
};

export function DailyVerseCard({ data }: DailyVerseCardProps) {
  const verse = data.passage.verses[0];

  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Daily Verse</h1>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-zinc-600">
          {data.source}
        </span>
      </div>

      <blockquote className="text-lg leading-8 text-zinc-800">
        <span>&ldquo;{verse?.text ?? "No verse available."}&rdquo;</span>
      </blockquote>

      <p className="text-sm text-zinc-600">
        {data.passage.reference} ({data.passage.translation.toUpperCase()})
      </p>
    </section>
  );
}
