import {
  normalizeHighlightNotes,
  normalizeHighlightNote,
} from "@/lib/reader/normalize";
import type { HighlightNote } from "@/lib/reader/types";

export type { HighlightNote } from "@/lib/reader/types";

const STORAGE_KEY = "reader_notes_v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getReaderNotes(): HighlightNote[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizeHighlightNotes(parsed);
  } catch {
    return [];
  }
}

export function setReaderNotes(notes: HighlightNote[]) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notes.flatMap((note) => normalizeHighlightNote(note) ?? [])),
    );
  } catch {
    // Ignore storage errors.
  }
}
