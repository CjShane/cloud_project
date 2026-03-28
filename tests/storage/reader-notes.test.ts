import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  getReaderNotes,
  setReaderNotes,
  type HighlightNote,
} from "@/lib/storage/reader-notes";

function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

describe("reader-notes storage", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    // @ts-expect-error - testing shim for window/localStorage
    globalThis.window = { localStorage: createLocalStorageMock() };
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it("returns empty array when no notes are stored", () => {
    expect(getReaderNotes()).toEqual([]);
  });

  it("stores and retrieves notes", () => {
    const note: HighlightNote = {
      id: "note-1",
      bookId: "GEN",
      chapter: 1,
      translation: "web",
      startVerse: 1,
      endVerse: 2,
      startOffset: 0,
      endOffset: 5,
      text: "In the",
      note: "Opening line",
      createdAt: 1,
      updatedAt: 2,
    };

    setReaderNotes([note]);
    expect(getReaderNotes()).toEqual([note]);
  });

  it("filters invalid notes from storage", () => {
    const storage = createLocalStorageMock();
    storage.setItem(
      "reader_notes_v1",
      JSON.stringify([
        { id: "", chapter: 1 },
        {
          id: "note-2",
          bookId: "EXO",
          chapter: 2,
          translation: "web",
          startVerse: 1,
          endVerse: 1,
          startOffset: 0,
          endOffset: 3,
          text: "Now",
          note: "",
          createdAt: 1,
          updatedAt: 1,
        },
      ]),
    );

    // @ts-expect-error - testing shim for window/localStorage
    globalThis.window = { localStorage: storage };

    expect(getReaderNotes()).toEqual([
      {
        id: "note-2",
        bookId: "EXO",
        chapter: 2,
        translation: "web",
        startVerse: 1,
        endVerse: 1,
        startOffset: 0,
        endOffset: 3,
        text: "Now",
        note: "",
        createdAt: 1,
        updatedAt: 1,
      },
    ]);
  });
});
