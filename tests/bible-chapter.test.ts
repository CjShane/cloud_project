import { describe, expect, it } from "vitest";

import { fetchBibleChapter } from "../lib/api/bible-api";
import { AppError } from "../lib/errors/app-error";

describe("fetchBibleChapter", () => {
  it("loads and normalizes a local chapter", async () => {
    const result = await fetchBibleChapter("GEN", 1, "web");

    expect(result.reference).toBe("Genesis 1");
    expect(result.translation).toBe("web");
    expect(result.verses.length).toBeGreaterThan(0);
    expect(result.verses[0]).toMatchObject({
      book: "Genesis",
      chapter: 1,
      verse: 1,
    });
  });

  it("maps missing local chapters to NOT_FOUND", async () => {
    await expect(fetchBibleChapter("GEN", 999, "web")).rejects.toMatchObject({
      code: "NOT_FOUND",
    } satisfies Partial<AppError>);
  });
});
