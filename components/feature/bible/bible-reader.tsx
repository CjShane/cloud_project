import type { BookMeta } from "@/lib/bible/books";
import type { ChapterLocation } from "@/lib/bible/navigation";
import type { NormalizedPassage } from "@/lib/normalize/bible";
import { BibleReaderControls } from "@/components/feature/bible/bible-reader-controls";
import { BibleReaderNav } from "@/components/feature/bible/bible-reader-nav";
import { BibleReaderAnnotations } from "@/components/feature/bible/bible-reader-annotations";
import { BibleReaderResume } from "@/components/feature/bible/bible-reader-resume";

type BibleReaderProps = {
  books: BookMeta[];
  book: BookMeta;
  chapter: number;
  requestedChapter: number;
  translation: string;
  passage: NormalizedPassage | null;
  isOutOfRange: boolean;
  isMissing: boolean;
  isRateLimited: boolean;
  previous: ChapterLocation | null;
  next: ChapterLocation | null;
  hasExplicitParams: boolean;
};

function buildReaderUrl(bookId: string, chapter: number, translation: string) {
  const params = new URLSearchParams({
    book: bookId,
    chapter: String(chapter),
    translation: translation || "web",
  });

  return `/bible?${params.toString()}`;
}

export function BibleReader({
  books,
  book,
  chapter,
  requestedChapter,
  translation,
  passage,
  isOutOfRange,
  isMissing,
  isRateLimited,
  previous,
  next,
  hasExplicitParams,
}: BibleReaderProps) {
  const translationLabel = translation.toUpperCase();
  const previousHref = previous
    ? buildReaderUrl(previous.book.id, previous.chapter, translation)
    : null;
  const nextHref = next
    ? buildReaderUrl(next.book.id, next.chapter, translation)
    : null;

  const cooldownMs = isRateLimited ? 1000 : 250;

  return (
    <section className="space-y-6">
      <BibleReaderResume hasExplicitParams={hasExplicitParams} />
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Bible Reader</h1>
        <p className="text-muted-foreground">
          Read the Bible by book and chapter with normalized scripture data.
        </p>
      </header>

      <BibleReaderControls
        key={`${book.id}-${chapter}-${translation}`}
        books={books}
        currentBookId={book.id}
        currentChapter={chapter}
        translation={translation}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <BibleReaderNav
          previousHref={previousHref}
          nextHref={nextHref}
          cooldownMs={cooldownMs}
        />
        <span className="text-sm text-muted-foreground">
          {book.name} {chapter} ({translationLabel})
        </span>
      </div>

      {isOutOfRange ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Chapter {requestedChapter} is outside the valid range for {book.name}.
          Choose a chapter between 1 and {book.chapters}.
        </div>
      ) : null}

      {isMissing ? (
        <div className="rounded-md border border-border bg-card px-4 py-3 text-muted-foreground">
          We could not load this chapter. Double-check the translation id or try
          another chapter.
        </div>
      ) : null}

      {isRateLimited ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Rate limit reached. Please wait a moment before continuing to the
          next chapter.
        </div>
      ) : null}

      {passage ? (
        <BibleReaderAnnotations
          bookId={book.id}
          bookName={book.name}
          chapter={chapter}
          translation={translation}
          passage={passage}
          allowProgressSave={hasExplicitParams}
        />
      ) : null}
    </section>
  );
}

