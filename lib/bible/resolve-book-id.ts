import { BOOKS } from "@/lib/bible/books";

type BookMatch = {
  key: string;
  id: string;
};

const BOOK_MATCHERS: BookMatch[] = BOOKS.flatMap((book) => {
  const normalized = book.name.toLowerCase();
  const compact = normalized.replace(/\s+/g, "");
  return [
    { key: normalized, id: book.id },
    { key: compact, id: book.id },
    { key: book.id.toLowerCase(), id: book.id },
  ];
}).sort((a, b) => b.key.length - a.key.length);

export function resolveBookId(reference: string) {
  const normalized = reference
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();

  for (const matcher of BOOK_MATCHERS) {
    if (normalized.startsWith(`${matcher.key} `)) {
      return matcher.id;
    }
    if (normalized === matcher.key) {
      return matcher.id;
    }
  }

  return null;
}
