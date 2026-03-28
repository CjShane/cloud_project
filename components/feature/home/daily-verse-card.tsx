import type { DailyVerseResult } from "@/lib/api/daily-verse";

type DailyVerseCardProps = {
  data: DailyVerseResult;
};

export function DailyVerseCard({ data }: DailyVerseCardProps) {
  const verse = data.passage.verses[0];

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-6 text-foreground">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Daily Verse</h1>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {data.source}
        </span>
      </div>

      <blockquote className="font-serif text-lg leading-8 text-foreground">
        <span>&ldquo;{verse?.text ?? "No verse available."}&rdquo;</span>
      </blockquote>

      <p className="text-sm text-muted-foreground">
        {data.passage.reference} ({data.passage.translation.toUpperCase()})
      </p>
    </section>
  );
}
