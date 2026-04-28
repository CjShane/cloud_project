import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mergeLocalReaderDataToAccount } from "@/lib/storage/reader-sync";
import { setReaderNotes, type HighlightNote } from "@/lib/storage/reader-notes";
import { setReaderProgress } from "@/lib/storage/reader-progress";

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

describe("reader account sync", () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // @ts-expect-error - testing shim for window/localStorage
    globalThis.window = { localStorage: createLocalStorageMock() };
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("merges local notes into the authenticated account", async () => {
    const localNote: HighlightNote = {
      id: "note-1",
      bookId: "GEN",
      chapter: 1,
      translation: "web",
      startVerse: 1,
      endVerse: 1,
      startOffset: 0,
      endOffset: 3,
      text: "In",
      note: "local",
      createdAt: 1,
      updatedAt: 3,
    };
    setReaderNotes([localNote]);
    setReaderProgress({ bookId: "GEN", chapter: 1, translation: "web" });

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/user/notes" && !init?.method) {
        return Response.json({
          data: {
            notes: [{ ...localNote, note: "remote", updatedAt: 2 }],
          },
        });
      }
      return Response.json({ data: { ok: true } });
    });
    globalThis.fetch = fetchMock as typeof fetch;

    await mergeLocalReaderDataToAccount();

    const notesPost = fetchMock.mock.calls.find(
      ([url, init]) => url === "/api/user/notes" && init?.method === "POST",
    );
    expect(notesPost).toBeTruthy();
    expect(JSON.parse(String(notesPost?.[1]?.body))).toMatchObject({
      notes: [{ id: "note-1", note: "local" }],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/user/progress",
      expect.objectContaining({ method: "PUT" }),
    );
  });
});
