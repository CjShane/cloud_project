"use client";

import { PageShell } from "@/components/ui/page-shell";

type LookupErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function LookupErrorPage({
  error,
  reset,
}: LookupErrorPageProps) {
  return (
    <PageShell>
      <section className="space-y-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        <h1 className="text-xl font-semibold">Unable to load Bible lookup</h1>
        <p>{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-red-700 px-4 py-2 text-white dark:bg-red-300 dark:text-red-950"
        >
          Try again
        </button>
      </section>
    </PageShell>
  );
}