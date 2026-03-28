import { PageShell } from "@/components/ui/page-shell";

export default function LoadingBiblePage() {
  return (
    <PageShell>
      <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
        Loading Bible reader...
      </div>
    </PageShell>
  );
}
