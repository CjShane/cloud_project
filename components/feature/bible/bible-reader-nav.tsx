"use client";

import Link from "next/link";
import { useState } from "react";
import { setReaderProgress } from "@/lib/storage/reader-progress";

type BibleReaderNavProps = {
  previousHref?: string | null;
  nextHref?: string | null;
  cooldownMs?: number;
};

export function BibleReaderNav({
  previousHref,
  nextHref,
  cooldownMs = 250,
}: BibleReaderNavProps) {
  const [nextCoolingDown, setNextCoolingDown] = useState(false);

  function persistProgress(href: string) {
    try {
      const url = new URL(href, window.location.origin);
      const bookId = url.searchParams.get("book");
      const chapter = url.searchParams.get("chapter");
      const translation = url.searchParams.get("translation");

      if (!bookId || !chapter || !translation) {
        return;
      }

      const chapterNumber = Number(chapter);
      if (!Number.isFinite(chapterNumber)) {
        return;
      }

      setReaderProgress({
        bookId,
        chapter: chapterNumber,
        translation,
      });
    } catch {
      // Ignore parsing errors.
    }
  }

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3"
      aria-label="Chapter navigation"
    >
      {previousHref ? (
        <Link
          href={previousHref}
          onClick={() => persistProgress(previousHref)}
          className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          Previous
        </span>
      )}

      <span className="text-sm text-muted-foreground">Chapter</span>

      {nextHref ? (
        <Link
          href={nextHref}
          onClick={(event) => {
            if (nextCoolingDown) {
              event.preventDefault();
              return;
            }
            setNextCoolingDown(true);
            setTimeout(() => setNextCoolingDown(false), cooldownMs);
            persistProgress(nextHref);
          }}
          className={
            nextCoolingDown
              ? "pointer-events-none rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
              : "rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
          }
          aria-disabled={nextCoolingDown}
        >
          Next
        </Link>
      ) : (
        <span className="rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          Next
        </span>
      )}
    </nav>
  );
}
