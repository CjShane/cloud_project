import Link from "next/link";

export function HomeHero() {
  return (
    <section className="space-y-4">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
        Cloud Project
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Read and explore Scripture in one place.
      </h1>
      <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-300">
        Browse by book and chapter, look up passages on demand, and compare
        translations with normalized API data.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/bible"
          className="inline-flex rounded-md border border-zinc-300 bg-zinc-100/60 px-4 py-2 text-sm font-medium text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-100"
        >
          Read the Bible
        </Link>
        <Link
          href="/lookup"
          className="inline-flex rounded-md border border-zinc-300 bg-zinc-100/60 px-4 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-200"
        >
          Lookup a Passage
        </Link>
        <Link
          href="/daily"
          className="inline-flex rounded-md border border-zinc-300 bg-zinc-100/60 px-4 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-200"
        >
          View Daily Verse
        </Link>
        <Link
          href="/compare"
          className="inline-flex rounded-md border border-zinc-300 bg-zinc-100/60 px-4 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-200"
        >
          Compare Translations
        </Link>
      </div>
    </section>
  );
}
