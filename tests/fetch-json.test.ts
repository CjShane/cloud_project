import { describe, expect, it, vi } from "vitest";

import { AppError } from "../lib/errors/app-error";
import { fetchJson } from "../lib/api/fetch-json";

describe("fetchJson", () => {
  it("maps 404 to NOT_FOUND", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 404 } as Response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchJson("https://example.com")).rejects.toMatchObject({
      code: "NOT_FOUND",
    } satisfies Partial<AppError>);
  });
});
