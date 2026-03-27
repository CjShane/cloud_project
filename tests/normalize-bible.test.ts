import { describe, expect, it } from "vitest";

import { AppError } from "../lib/errors/app-error";
import { normalizeBiblePassage } from "../lib/normalize/bible";

describe("normalizeBiblePassage", () => {
  it("normalizes raw payload into typed verses", () => {
    const result = normalizeBiblePassage(
      {
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
      },
      "web",
    );

    expect(result.reference).toBe("John 3:16");
    expect(result.translation).toBe("web");
    expect(result.verses).toHaveLength(1);
    expect(result.verses[0]).toEqual({
      book: "John",
      chapter: 3,
      verse: 16,
      text: "For God so loved the world",
      translation: "web",
      reference: "John 3:16",
    });
  });

  it("throws for missing verses array", () => {
    expect(() =>
      normalizeBiblePassage(
        {
          reference: "John 3:16",
        },
        "web",
      ),
    ).toThrowError(AppError);
  });
});
