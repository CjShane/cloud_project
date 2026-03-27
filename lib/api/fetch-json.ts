import { AppError } from "@/lib/errors/app-error";

type FetchJsonOptions = {
  timeoutMs?: number;
  init?: RequestInit;
};

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const { timeoutMs = 10000, init } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });

    if (!response.ok) {
      if (response.status === 404) {
        throw new AppError("NOT_FOUND", "Resource not found.", 404);
      }
      if (response.status === 429) {
        throw new AppError("RATE_LIMITED", "Rate limit reached.", 429);
      }
      throw new AppError(
        "UPSTREAM_UNAVAILABLE",
        "Upstream service is unavailable.",
        response.status,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new AppError("INVALID_RESPONSE", "Invalid response payload.");
    }
    throw new AppError("NETWORK_ERROR", "Network request failed.");
  } finally {
    clearTimeout(timer);
  }
}
