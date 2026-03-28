import { BOOKS, DEFAULT_BOOK_ID, type BookMeta } from "@/lib/bible/books";

export type ChapterLocation = {
  book: BookMeta;
  chapter: number;
};

export function getBookById(id?: string | null): BookMeta | null {
  if (!id) {
    return null;
  }

  const normalized = id.toUpperCase();
  return BOOKS.find((book) => book.id === normalized) ?? null;
}

export function getBookOrDefault(id?: string | null): BookMeta {
  return getBookById(id) ?? getBookById(DEFAULT_BOOK_ID) ?? BOOKS[0];
}

export function resolveChapter(
  value: string | null | undefined,
  book: BookMeta,
): { chapter: number; requested: number; isOutOfRange: boolean } {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return { chapter: 1, requested: 1, isOutOfRange: false };
  }

  if (parsed > book.chapters) {
    return { chapter: book.chapters, requested: parsed, isOutOfRange: true };
  }

  return { chapter: parsed, requested: parsed, isOutOfRange: false };
}

export function getNextChapter(location: ChapterLocation): ChapterLocation | null {
  const { book, chapter } = location;

  if (chapter < book.chapters) {
    return { book, chapter: chapter + 1 };
  }

  const currentIndex = BOOKS.findIndex((entry) => entry.id === book.id);
  if (currentIndex < 0 || currentIndex + 1 >= BOOKS.length) {
    return null;
  }

  const nextBook = BOOKS[currentIndex + 1];
  return { book: nextBook, chapter: 1 };
}

export function getPreviousChapter(
  location: ChapterLocation,
): ChapterLocation | null {
  const { book, chapter } = location;

  if (chapter > 1) {
    return { book, chapter: chapter - 1 };
  }

  const currentIndex = BOOKS.findIndex((entry) => entry.id === book.id);
  if (currentIndex <= 0) {
    return null;
  }

  const prevBook = BOOKS[currentIndex - 1];
  return { book: prevBook, chapter: prevBook.chapters };
}
