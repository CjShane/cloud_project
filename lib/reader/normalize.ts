import type { HighlightNote, ReaderProgress } from "@/lib/reader/types";

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeHighlightNote(value: unknown): HighlightNote | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const input = value as Record<string, unknown>;
  const id = stringValue(input.id);
  const bookId = stringValue(input.bookId).toUpperCase();
  const translation = stringValue(input.translation).toLowerCase();
  const text = typeof input.text === "string" ? input.text : "";
  const note = typeof input.note === "string" ? input.note : "";
  const chapter = finiteNumber(input.chapter);
  const startVerse = finiteNumber(input.startVerse);
  const endVerse = finiteNumber(input.endVerse);
  const startOffset = finiteNumber(input.startOffset);
  const endOffset = finiteNumber(input.endOffset);
  const createdAt = finiteNumber(input.createdAt);
  const updatedAt = finiteNumber(input.updatedAt);

  if (
    !id ||
    !bookId ||
    !translation ||
    chapter === null ||
    startVerse === null ||
    endVerse === null ||
    startOffset === null ||
    endOffset === null ||
    createdAt === null ||
    updatedAt === null ||
    chapter <= 0 ||
    startVerse <= 0 ||
    endVerse < startVerse ||
    startOffset < 0 ||
    endOffset < 0
  ) {
    return null;
  }

  return {
    id,
    bookId,
    chapter,
    translation,
    startVerse,
    endVerse,
    startOffset,
    endOffset,
    text,
    note,
    createdAt,
    updatedAt,
  };
}

export function normalizeHighlightNotes(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((entry) => {
    const note = normalizeHighlightNote(entry);
    return note ? [note] : [];
  });
}

export function normalizeReaderProgress(value: unknown): ReaderProgress | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const input = value as Record<string, unknown>;
  const bookId = stringValue(input.bookId).toUpperCase();
  const translation = stringValue(input.translation).toLowerCase();
  const chapter = finiteNumber(input.chapter);

  if (!bookId || !translation || chapter === null || chapter <= 0) {
    return null;
  }

  return {
    bookId,
    chapter,
    translation,
  };
}
