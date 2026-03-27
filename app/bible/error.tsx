"use client";

import { PageShell } from "@/components/ui/page-shell";

type BibleErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function BibleErrorPage({ error, reset }: BibleErrorPageProps) {
  return (
    <PageShell>
      <section className="space-y-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        <h1 className="text-xl font-semibold">Unable to load Bible page</h1>
        <p>{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-red-700 px-4 py-2 text-white"
        >
          Try again
        </button>
      </section>
    </PageShell>
  );
}
