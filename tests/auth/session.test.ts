import { afterEach, describe, expect, it } from "vitest";
import {
  createRawSessionToken,
  hashSessionToken,
  sessionCookieSecure,
} from "@/lib/auth/session";

describe("session tokens", () => {
  const originalSecret = process.env.AUTH_SECRET;
  const originalCookieSecure = process.env.SESSION_COOKIE_SECURE;

  afterEach(() => {
    process.env.AUTH_SECRET = originalSecret;
    process.env.SESSION_COOKIE_SECURE = originalCookieSecure;
  });

  it("hashes raw tokens with the configured auth secret", () => {
    process.env.AUTH_SECRET = "12345678901234567890123456789012";

    const token = createRawSessionToken();
    const hash = hashSessionToken(token);

    expect(token).not.toEqual(hash);
    expect(hash).toHaveLength(64);
    expect(hashSessionToken(token)).toEqual(hash);
  });

  it("allows plain HTTP cookies when configured for EC2 HTTP hosting", () => {
    process.env.SESSION_COOKIE_SECURE = "false";

    expect(sessionCookieSecure()).toBe(false);
  });
});
