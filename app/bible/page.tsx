import { BibleReader } from "@/components/feature/bible/bible-reader";
import { PageShell } from "@/components/ui/page-shell";
import { fetchBibleChapter } from "@/lib/api/bible-api";
import { BOOKS } from "@/lib/bible/books";
import {
  getBookOrDefault,
  getNextChapter,
  getPreviousChapter,
  resolveChapter,
} from "@/lib/bible/navigation";
import { AppError } from "@/lib/errors/app-error";

export const dynamic = "force-dynamic";

type BibleReaderPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function BiblePage({ searchParams }: BibleReaderPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const bookParam = getFirstParam(resolvedParams.book);
  const chapterParam = getFirstParam(resolvedParams.chapter);
  const translationParam = getFirstParam(resolvedParams.translation);
  const hasExplicitParams = Boolean(
    bookParam || chapterParam || translationParam,
  );

  const book = getBookOrDefault(bookParam);
  const { chapter, requested, isOutOfRange } = resolveChapter(
    chapterParam,
    book,
  );
  const translation = translationParam?.trim().toLowerCase() || "web";

  let passage = null;
  let isMissing = false;
  let isRateLimited = false;

  if (!isOutOfRange) {
    try {
      passage = await fetchBibleChapter(book.id, chapter, translation);
    } catch (error) {
      if (error instanceof AppError) {
        if (error.code === "RATE_LIMITED") {
          isRateLimited = true;
        } else if (
          error.code === "NOT_FOUND" ||
          error.code === "INVALID_RESPONSE"
        ) {
          isMissing = true;
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  const effectiveTranslation = passage?.translation ?? translation;

  const current = { book, chapter };
  const previous = getPreviousChapter(current);
  const next = getNextChapter(current);

  return (
    <PageShell>
      <BibleReader
        books={BOOKS}
        book={book}
        chapter={chapter}
        requestedChapter={requested}
        translation={effectiveTranslation}
        passage={passage}
        isOutOfRange={isOutOfRange}
        isMissing={isMissing}
        isRateLimited={isRateLimited}
        previous={previous}
        next={next}
        hasExplicitParams={hasExplicitParams}
      />
    </PageShell>
  );
}

