import { describe, expect, it } from "vitest";

import {
  getBookOrDefault,
  getNextChapter,
  getPreviousChapter,
  resolveChapter,
} from "../lib/bible/navigation";

describe("bible navigation", () => {
  it("moves to the next book after the last chapter", () => {
    const genesis = getBookOrDefault("GEN");
    const result = getNextChapter({ book: genesis, chapter: genesis.chapters });

    expect(result?.book.id).toBe("EXO");
    expect(result?.chapter).toBe(1);
  });

  it("moves to the previous book from chapter one", () => {
    const exodus = getBookOrDefault("EXO");
    const result = getPreviousChapter({ book: exodus, chapter: 1 });

    expect(result?.book.id).toBe("GEN");
    expect(result?.chapter).toBe(50);
  });

  it("returns null at the end of Revelation", () => {
    const revelation = getBookOrDefault("REV");
    const result = getNextChapter({
      book: revelation,
      chapter: revelation.chapters,
    });

    expect(result).toBeNull();
  });

  it("flags chapters outside the valid range", () => {
    const jude = getBookOrDefault("JUD");
    const result = resolveChapter("10", jude);

    expect(result.isOutOfRange).toBe(true);
    expect(result.chapter).toBe(1);
  });
});