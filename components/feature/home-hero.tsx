import Link from "next/link";

export function HomeHero() {
  return (
    <section className="space-y-4">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        Cloud Project
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Next.js app scaffold is ready.
      </h1>
      <p className="max-w-2xl text-base text-zinc-600">
        We are set up with TypeScript, App Router, Tailwind CSS, and an
        EC2-first project structure. Next step is implementing the first
        feature in `feature-plan.md`.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/bible"
          className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Open Bible Lookup
        </Link>
        <Link
          href="/daily"
          className="inline-flex rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800"
        >
          View Daily Verse
        </Link>
        <Link
          href="/compare"
          className="inline-flex rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800"
        >
          Compare Translations
        </Link>
      </div>
    </section>
  );
}
