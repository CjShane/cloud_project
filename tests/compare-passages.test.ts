import { describe, expect, it, vi } from "vitest";

import { fetchComparedPassages } from "../lib/api/compare-passages";

describe("fetchComparedPassages", () => {
  it("returns two normalized passages", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
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
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reference: "John 3:16",
          translation_id: "kjv",
          verses: [
            {
              book_name: "John",
              chapter: 3,
              verse: 16,
              text: " For God so loved the world, that he gave his only begotten Son ",
            },
          ],
        }),
      } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchComparedPassages("John 3:16", "web", "kjv");

    expect(result.primary.translation).toBe("web");
    expect(result.secondary.translation).toBe("kjv");
    expect(result.primary.verses[0].chapter).toBe(3);
    expect(result.secondary.verses[0].verse).toBe(16);
  });
});
