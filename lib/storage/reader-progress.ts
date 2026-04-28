import { normalizeReaderProgress } from "@/lib/reader/normalize";
import type { ReaderProgress } from "@/lib/reader/types";

export type { ReaderProgress } from "@/lib/reader/types";

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
    return normalizeReaderProgress(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function setReaderProgress(progress: ReaderProgress) {
  if (!isBrowser()) {
    return;
  }

  try {
    const payload = normalizeReaderProgress(progress);
    if (!payload) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage errors.
  }
}
