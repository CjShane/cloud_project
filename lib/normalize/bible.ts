import { AppError } from "@/lib/errors/app-error";
import { normalizeText } from "@/lib/normalize/normalize-text";

type BibleApiVerseRaw = {
  book_name?: unknown;
  chapter?: unknown;
  verse?: unknown;
  text?: unknown;
};

export type BibleApiPassageRaw = {
  reference?: unknown;
  translation_id?: unknown;
  verses?: unknown;
};

export type NormalizedVerse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  reference: string;
};

export type NormalizedPassage = {
  reference: string;
  translation: string;
  verses: NormalizedVerse[];
};

function toNumber(value: unknown, fieldName: string): number {
  const num = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(num)) {
    throw new AppError("INVALID_RESPONSE", `Invalid ${fieldName} value.`);
  }

  return num;
}

function toText(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new AppError("INVALID_RESPONSE", `Invalid ${fieldName} value.`);
  }

  return normalizeText(value);
}

export function normalizeBiblePassage(
  raw: BibleApiPassageRaw,
  requestedTranslation = "web",
): NormalizedPassage {
  if (!Array.isArray(raw.verses)) {
    throw new AppError("INVALID_RESPONSE", "Missing verses array.");
  }

  const translation =
    typeof raw.translation_id === "string" && raw.translation_id.trim()
      ? normalizeText(raw.translation_id)
      : requestedTranslation;

  const verses = raw.verses.map((entry): NormalizedVerse => {
    const verseRaw = entry as BibleApiVerseRaw;
    const book = toText(verseRaw.book_name, "book_name");
    const chapter = toNumber(verseRaw.chapter, "chapter");
    const verse = toNumber(verseRaw.verse, "verse");
    const text = toText(verseRaw.text, "text");
    const reference = `${book} ${chapter}:${verse}`;

    return {
      book,
      chapter,
      verse,
      text,
      translation,
      reference,
    };
  });

  const reference =
    typeof raw.reference === "string" && raw.reference.trim()
      ? normalizeText(raw.reference)
      : verses[0]?.reference ?? "";

  return {
    reference,
    translation,
    verses,
  };
}
