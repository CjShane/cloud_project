import { DailyVerseCard } from "@/components/feature/daily-verse-card";
import { PageShell } from "@/components/ui/page-shell";
import { fetchDailyVerse } from "@/lib/api/daily-verse";

export const revalidate = 3600;

export default async function DailyPage() {
  const data = await fetchDailyVerse("web");

  return (
    <PageShell>
      <DailyVerseCard data={data} />
    </PageShell>
  );
}
