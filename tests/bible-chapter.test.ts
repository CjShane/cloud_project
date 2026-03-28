import { describe, expect, it, vi } from "vitest";

import { fetchBibleChapter } from "../lib/api/bible-api";
import { AppError } from "../lib/errors/app-error";

describe("fetchBibleChapter", () => {
  it("builds the chapter endpoint and normalizes the response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reference: "Genesis 1",
        translation_id: "web",
        verses: [
          {
            book_name: "Genesis",
            chapter: 1,
            verse: 1,
            text: " In the beginning ",
          },
        ],
      }),
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchBibleChapter("GEN", 1, "web");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://bible-api.com/data/web/GEN/1",
      expect.any(Object),
    );
    expect(result.reference).toBe("Genesis 1");
    expect(result.verses[0].text).toBe("In the beginning");
  });

  it("maps 404s to NOT_FOUND", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 404 } as Response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchBibleChapter("GEN", 1, "web")).rejects.toMatchObject({
      code: "NOT_FOUND",
    } satisfies Partial<AppError>);
  });
});