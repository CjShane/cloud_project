"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BookMeta } from "@/lib/bible/books";
import { setReaderProgress } from "@/lib/storage/reader-progress";
import { saveReaderProgressToAccount } from "@/lib/storage/reader-sync";
import { TranslationSelect } from "@/components/feature/bible/translation-select";

type BibleReaderControlsProps = {
  books: BookMeta[];
  currentBookId: string;
  currentChapter: number;
  translation: string;
};

function buildReaderUrl(bookId: string, chapter: number, translation: string) {
  const params = new URLSearchParams({
    book: bookId,
    chapter: String(chapter),
    translation: translation || "web",
  });

  return `/bible?${params.toString()}`;
}

export function BibleReaderControls({
  books,
  currentBookId,
  currentChapter,
  translation,
}: BibleReaderControlsProps) {
  const router = useRouter();
  const [bookId, setBookId] = useState(currentBookId);
  const [chapter, setChapter] = useState(currentChapter);
  const [translationId, setTranslationId] = useState(translation);

  const currentBook = useMemo(() => {
    return books.find((book) => book.id === bookId) ?? books[0];
  }, [bookId, books]);

  const chapterOptions = useMemo(() => {
    return Array.from({ length: currentBook.chapters }, (_, index) => index + 1);
  }, [currentBook.chapters]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const normalizedTranslation =
          translationId.trim().toLowerCase() || "web";
        const progress = {
          bookId,
          chapter,
          translation: normalizedTranslation,
        };
        setReaderProgress(progress);
        void saveReaderProgressToAccount(progress).catch(() => {});
        router.push(buildReaderUrl(bookId, chapter, normalizedTranslation));
      }}
      className="grid gap-3 rounded-lg border border-border bg-card p-4 text-sm text-foreground md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
    >
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Book</span>
        <select
          value={bookId}
          onChange={(event) => {
            const nextBook = event.target.value;
            setBookId(nextBook);
            setChapter(1);
          }}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
          aria-label="Book"
        >
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Chapter</span>
        <select
          value={chapter}
          onChange={(event) => setChapter(Number(event.target.value))}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
          aria-label="Chapter"
        >
          {chapterOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Translation
        </span>
        <TranslationSelect
          value={translationId}
          onChange={setTranslationId}
          placeholder="Translation"
          bookId={bookId}
        />
      </label>

      <button
        type="submit"
        className="self-end rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
      >
        Read
      </button>
    </form>
  );
}

