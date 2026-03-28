import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  getReaderProgress,
  setReaderProgress,
} from "@/lib/storage/reader-progress";

function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

describe("reader-progress storage", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    // @ts-expect-error - testing shim for window/localStorage
    globalThis.window = { localStorage: createLocalStorageMock() };
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it("returns null when no progress is stored", () => {
    expect(getReaderProgress()).toBeNull();
  });

  it("stores and retrieves reader progress", () => {
    setReaderProgress({
      bookId: "GEN",
      chapter: 3,
      translation: "web",
    });

    expect(getReaderProgress()).toEqual({
      bookId: "GEN",
      chapter: 3,
      translation: "web",
    });
  });

  it("ignores invalid stored data", () => {
    const storage = createLocalStorageMock();
    storage.setItem("reader_progress_v1", JSON.stringify({ chapter: "bad" }));

    // @ts-expect-error - testing shim for window/localStorage
    globalThis.window = { localStorage: storage };

    expect(getReaderProgress()).toBeNull();
  });
});
