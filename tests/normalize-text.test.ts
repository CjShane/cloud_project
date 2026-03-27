import { describe, expect, it } from "vitest";

import { normalizeText } from "../lib/normalize/normalize-text";

describe("normalizeText", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeText("  For   God so   loved   ")).toBe("For God so loved");
  });
});
