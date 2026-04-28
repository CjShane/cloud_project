import { describe, expect, it } from "vitest";

import { fetchDailyVerse, fetchRandomVerse } from "../lib/api/daily-verse";

describe("daily verse api", () => {
  it("normalizes a random local verse", async () => {
    const result = await fetchRandomVerse("web");

    expect(result.translation).toBe("web");
    expect(result.reference).toMatch(/\d+:\d+/);
    expect(result.verses).toHaveLength(1);
    expect(result.verses[0].text.length).toBeGreaterThan(0);
  });

  it("returns a deterministic daily local verse", async () => {
    const result = await fetchDailyVerse("web");

    expect(result.source).toBe("live");
    expect(result.passage.translation).toBe("web");
    expect(result.passage.verses).toHaveLength(1);
  });
});
