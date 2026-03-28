import fs from "node:fs/promises";
import path from "node:path";
import { AppError } from "@/lib/errors/app-error";
import { normalizeText } from "@/lib/normalize/normalize-text";
import { BOOKS } from "@/lib/bible/books";
import type { NormalizedPassage, NormalizedVerse } from "@/lib/normalize/bible";

type LocalBook = {
  chapters: string[][];
};

type LocalBible = {
  translation: string;
  name: string;
  language: string;
  books: Record<string, LocalBook>;
};

type LocalTranslation = {
  id: string;
  label: string;
  name: string;
  language: string;
  source: string;
  format: string;
};

const ROOT_DIR = process.cwd();
const BIBLES_DIR = path.join(ROOT_DIR, "bibles");
const JSON_DIR = path.join(BIBLES_DIR, "json");
const TRANSLATIONS_PATH = path.join(BIBLES_DIR, "translations.json");

const bibleCache = new Map<string, LocalBible>();
let translationsCache: LocalTranslation[] | null = null;
const SHOULD_CACHE = process.env.NODE_ENV === "production";

const BOOK_BY_ID = new Map(BOOKS.map((book) => [book.id, book]));
const BOOK_MATCHERS = BOOKS.flatMap((book) => {
  const normalized = book.name.toLowerCase();
  const compact = normalized.replace(/\s+/g, "");
  return [
    { key: normalized, id: book.id },
    { key: compact, id: book.id },
    { key: book.id.toLowerCase(), id: book.id },
  ];
}).sort((a, b) => b.key.length - a.key.length);

function resolveBookId(reference: string) {
  const normalized = reference
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();

  for (const matcher of BOOK_MATCHERS) {
    if (normalized.startsWith(`${matcher.key} `)) {
      return {
        bookId: matcher.id,
        remainder: normalized.slice(matcher.key.length).trim(),
      };
    }
    if (normalized === matcher.key) {
      return { bookId: matcher.id, remainder: "" };
    }
  }

  return null;
}

function parseReference(reference: string) {
  const match = resolveBookId(reference);
  if (!match) {
    throw new AppError("INVALID_REFERENCE", "Unable to parse reference.");
  }

  const remainder = match.remainder;
  if (!remainder) {
    throw new AppError("INVALID_REFERENCE", "Missing chapter.");
  }

  const rangeMatch = remainder.match(
    /^(\d+)(?::(\d+)(?:-(\d+))?)?$/,
  );
  if (!rangeMatch) {
    throw new AppError("INVALID_REFERENCE", "Invalid reference format.");
  }

  const chapter = Number(rangeMatch[1]);
  const verseStart = rangeMatch[2] ? Number(rangeMatch[2]) : null;
  const verseEnd = rangeMatch[3] ? Number(rangeMatch[3]) : null;

  return {
    bookId: match.bookId,
    chapter,
    verseStart,
    verseEnd,
  };
}

async function findAvailableTranslation(preferred: string) {
  const translations = await getLocalTranslations();
  const ids = translations.map((entry) => entry.id);
  const candidates = [preferred, "web", ...ids];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const normalized = candidate?.toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    const filePath = path.join(JSON_DIR, `${normalized}.json`);
    try {
      await fs.access(filePath);
      return normalized;
    } catch {
      continue;
    }
  }

  throw new AppError("NOT_FOUND", "Translation not found.");
}

export async function resolveTranslationId(translation: string) {
  return findAvailableTranslation(translation);
}

async function loadBible(translation: string) {
  const resolved = await findAvailableTranslation(translation);
  if (SHOULD_CACHE && bibleCache.has(resolved)) {
    return bibleCache.get(resolved) as LocalBible;
  }

  const filePath = path.join(JSON_DIR, `${resolved}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  const bible = JSON.parse(raw) as LocalBible;
  if (SHOULD_CACHE) {
    bibleCache.set(resolved, bible);
  }
  return bible;
}

async function loadBibleById(translationId: string) {
  if (SHOULD_CACHE && bibleCache.has(translationId)) {
    return bibleCache.get(translationId) as LocalBible;
  }

  const filePath = path.join(JSON_DIR, `${translationId}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  const bible = JSON.parse(raw) as LocalBible;
  if (SHOULD_CACHE) {
    bibleCache.set(translationId, bible);
  }
  return bible;
}

export async function getLocalTranslations() {
  if (SHOULD_CACHE && translationsCache) {
    return translationsCache;
  }

  const raw = await fs.readFile(TRANSLATIONS_PATH, "utf8");
  const parsed = JSON.parse(raw) as LocalTranslation[];
  if (SHOULD_CACHE) {
    translationsCache = parsed;
  }
  return parsed;
}

export async function getLocalTranslationsForBook(bookId: string) {
  const normalizedBookId = bookId.toUpperCase();
  const translations = await getLocalTranslations();
  const available: LocalTranslation[] = [];

  for (const translation of translations) {
    try {
      const bible = await loadBibleById(translation.id);
      if (bible.books[normalizedBookId]) {
        available.push(translation);
      }
    } catch {
      continue;
    }
  }

  return available;
}

function buildVerses(
  bookId: string,
  chapter: number,
  translation: string,
  verses: string[],
  verseStart?: number | null,
  verseEnd?: number | null,
): NormalizedVerse[] {
  const book = BOOK_BY_ID.get(bookId);
  const bookName = book?.name ?? bookId;
  const start = verseStart ?? 1;
  const end = verseEnd ?? verses.length - 1;

  const normalized: NormalizedVerse[] = [];
  for (let verse = start; verse <= end; verse += 1) {
    const text = normalizeText(verses[verse] ?? "");
    if (!text) continue;
    normalized.push({
      book: bookName,
      chapter,
      verse,
      text,
      translation,
      reference: `${bookName} ${chapter}:${verse}`,
    });
  }

  return normalized;
}

export async function getLocalChapterPassage(
  bookId: string,
  chapter: number,
  translation: string,
): Promise<NormalizedPassage> {
  const resolved = await resolveTranslationId(translation);
  const bible = await loadBible(resolved);
  const book = bible.books[bookId];
  if (!book) {
    throw new AppError("NOT_FOUND", "Book not found.");
  }
  const verses = book.chapters[chapter];
  if (!verses) {
    throw new AppError("NOT_FOUND", "Chapter not found.");
  }
  const bookName = BOOK_BY_ID.get(bookId)?.name ?? bookId;
  return {
    reference: `${bookName} ${chapter}`,
    translation: resolved,
    verses: buildVerses(bookId, chapter, resolved, verses),
  };
}

export async function getLocalPassage(
  reference: string,
  translation: string,
): Promise<NormalizedPassage> {
  const parsed = parseReference(reference);
  const resolved = await resolveTranslationId(translation);
  const bible = await loadBible(resolved);
  const book = bible.books[parsed.bookId];
  if (!book) {
    throw new AppError("NOT_FOUND", "Book not found.");
  }
  const verses = book.chapters[parsed.chapter];
  if (!verses) {
    throw new AppError("NOT_FOUND", "Chapter not found.");
  }

  const verseList = buildVerses(
    parsed.bookId,
    parsed.chapter,
    resolved,
    verses,
    parsed.verseStart,
    parsed.verseEnd ?? parsed.verseStart,
  );

  const bookName = BOOK_BY_ID.get(parsed.bookId)?.name ?? parsed.bookId;
  const referenceLabel = parsed.verseStart
    ? `${bookName} ${parsed.chapter}:${parsed.verseStart}${
        parsed.verseEnd ? `-${parsed.verseEnd}` : ""
      }`
    : `${bookName} ${parsed.chapter}`;

  return {
    reference: referenceLabel,
    translation: resolved,
    verses: verseList,
  };
}

export async function getRandomLocalVerse(translation: string) {
  const resolved = await resolveTranslationId(translation);
  const bible = await loadBible(resolved);
  const allBookIds = Object.keys(bible.books);
  const bookIds = allBookIds.filter((id) => BOOK_BY_ID.has(id));
  const candidates = bookIds.length > 0 ? bookIds : allBookIds;
  if (candidates.length === 0) {
    throw new AppError("NOT_FOUND", "No books available.");
  }

  const bookId = candidates[Math.floor(Math.random() * candidates.length)];
  const book = bible.books[bookId];
  const chapters = book.chapters
    .map((verses, index) => (verses ? index : null))
    .filter((value) => typeof value === "number" && value > 0) as number[];
  const chapter = chapters[Math.floor(Math.random() * chapters.length)];
  const verses = book.chapters[chapter];
  const verseNumbers = verses
    .map((text, index) => (text ? index : null))
    .filter((value) => typeof value === "number" && value > 0) as number[];
  const verse = verseNumbers[Math.floor(Math.random() * verseNumbers.length)];

  const passage = await getLocalPassage(
    `${BOOK_BY_ID.get(bookId)?.name ?? bookId} ${chapter}:${verse}`,
    resolved,
  );

  return passage;
}

function hashSeed(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export async function getDeterministicLocalVerse(
  translation: string,
  seed: string,
) {
  const resolved = await resolveTranslationId(translation);
  const bible = await loadBible(resolved);
  const allBookIds = Object.keys(bible.books);
  const bookIds = allBookIds.filter((id) => BOOK_BY_ID.has(id));
  const candidates = bookIds.length > 0 ? bookIds : allBookIds;
  if (candidates.length === 0) {
    throw new AppError("NOT_FOUND", "No books available.");
  }

  let state = hashSeed(seed);
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state;
  };

  const bookId = candidates[next() % candidates.length];
  const book = bible.books[bookId];
  const chapters = book.chapters
    .map((verses, index) => (verses ? index : null))
    .filter((value) => typeof value === "number" && value > 0) as number[];
  const chapter = chapters[next() % chapters.length];
  const verses = book.chapters[chapter];
  const verseNumbers = verses
    .map((text, index) => (text ? index : null))
    .filter((value) => typeof value === "number" && value > 0) as number[];
  const verse = verseNumbers[next() % verseNumbers.length];

  const passage = await getLocalPassage(
    `${BOOK_BY_ID.get(bookId)?.name ?? bookId} ${chapter}:${verse}`,
    resolved,
  );

  return passage;
}
