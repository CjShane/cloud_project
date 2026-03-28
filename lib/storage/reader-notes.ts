export type HighlightNote = {
  id: string;
  bookId: string;
  chapter: number;
  translation: string;
  startVerse: number;
  endVerse: number;
  startOffset: number;
  endOffset: number;
  text: string;
  note: string;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "reader_notes_v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isValidNote(note: HighlightNote) {
  return (
    typeof note.id === "string" &&
    note.id.length > 0 &&
    typeof note.bookId === "string" &&
    typeof note.translation === "string" &&
    typeof note.chapter === "number" &&
    typeof note.startVerse === "number" &&
    typeof note.endVerse === "number" &&
    typeof note.startOffset === "number" &&
    typeof note.endOffset === "number"
  );
}

export function getReaderNotes(): HighlightNote[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidNote) as HighlightNote[];
  } catch {
    return [];
  }
}

export function setReaderNotes(notes: HighlightNote[]) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Ignore storage errors.
  }
}
