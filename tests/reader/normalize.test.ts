import { describe, expect, it } from "vitest";
import {
  normalizeHighlightNote,
  normalizeReaderProgress,
} from "@/lib/reader/normalize";

describe("reader data normalization", () => {
  it("normalizes valid note payloads", () => {
    expect(
      normalizeHighlightNote({
        id: "note-1",
        bookId: "gen",
        chapter: 1,
        translation: "WEB",
        startVerse: 1,
        endVerse: 1,
        startOffset: 0,
        endOffset: 4,
        text: "In the beginning",
        note: "",
        createdAt: 10,
        updatedAt: 20,
      }),
    ).toMatchObject({
      id: "note-1",
      bookId: "GEN",
      translation: "web",
    });
  });

  it("rejects invalid note ranges", () => {
    expect(
      normalizeHighlightNote({
        id: "note-1",
        bookId: "GEN",
        chapter: 1,
        translation: "web",
        startVerse: 3,
        endVerse: 1,
        startOffset: 0,
        endOffset: 4,
        text: "Invalid",
        note: "",
        createdAt: 10,
        updatedAt: 20,
      }),
    ).toBeNull();
  });

  it("normalizes progress payloads", () => {
    expect(
      normalizeReaderProgress({
        bookId: "exo",
        chapter: 2,
        translation: "KJV",
      }),
    ).toEqual({
      bookId: "EXO",
      chapter: 2,
      translation: "kjv",
    });
  });
});
