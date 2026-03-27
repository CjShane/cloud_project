import { describe, expect, it, vi } from "vitest";

import { fetchDailyVerse, fetchRandomVerse } from "../lib/api/daily-verse";

describe("daily verse api", () => {
  it("normalizes random verse response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reference: "John 3:16",
        translation_id: "web",
        verses: [
          {
            book_name: "John",
            chapter: 3,
            verse: 16,
            text: " For God so loved the world ",
          },
        ],
      }),
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchRandomVerse("web");

    expect(result.reference).toBe("John 3:16");
    expect(result.verses[0].text).toBe("For God so loved the world");
  });

  it("falls back when random endpoint fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reference: "Psalm 23:1",
          translation_id: "web",
          verses: [
            {
              book_name: "Psalms",
              chapter: 23,
              verse: 1,
              text: " The LORD is my shepherd; I shall not want. ",
            },
          ],
        }),
      } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchDailyVerse("web");

    expect(result.source).toBe("fallback");
    expect(result.passage.reference).toBe("Psalm 23:1");
  });
});
