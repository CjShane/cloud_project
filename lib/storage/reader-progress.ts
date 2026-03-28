export type ReaderProgress = {
  bookId: string;
  chapter: number;
  translation: string;
};

const STORAGE_KEY = "reader_progress_v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getReaderProgress(): ReaderProgress | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ReaderProgress>;

    if (
      typeof parsed.bookId !== "string" ||
      !parsed.bookId.trim() ||
      typeof parsed.translation !== "string" ||
      !parsed.translation.trim() ||
      typeof parsed.chapter !== "number" ||
      !Number.isFinite(parsed.chapter) ||
      parsed.chapter <= 0
    ) {
      return null;
    }

    return {
      bookId: parsed.bookId,
      chapter: parsed.chapter,
      translation: parsed.translation,
    };
  } catch {
    return null;
  }
}

export function setReaderProgress(progress: ReaderProgress) {
  if (!isBrowser()) {
    return;
  }

  try {
    const payload: ReaderProgress = {
      bookId: progress.bookId,
      chapter: progress.chapter,
      translation: progress.translation,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage errors.
  }
}
