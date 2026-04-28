import { afterEach, describe, expect, it } from "vitest";
import { createRawSessionToken, hashSessionToken } from "@/lib/auth/session";

describe("session tokens", () => {
  const originalSecret = process.env.AUTH_SECRET;

  afterEach(() => {
    process.env.AUTH_SECRET = originalSecret;
  });

  it("hashes raw tokens with the configured auth secret", () => {
    process.env.AUTH_SECRET = "12345678901234567890123456789012";

    const token = createRawSessionToken();
    const hash = hashSessionToken(token);

    expect(token).not.toEqual(hash);
    expect(hash).toHaveLength(64);
    expect(hashSessionToken(token)).toEqual(hash);
  });
});
