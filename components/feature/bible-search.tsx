"use client";

import { FormEvent, useState } from "react";

type BibleVerse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  reference: string;
};

type BiblePassage = {
  reference: string;
  translation: string;
  verses: BibleVerse[];
};

type ApiError = {
  code: string;
  message: string;
};

type ApiResponse =
  | {
      data: BiblePassage;
      error?: never;
    }
  | {
      data?: never;
      error: ApiError;
    };

export function BibleSearch() {
  const [reference, setReference] = useState("John 3:16");
  const [translation, setTranslation] = useState("web");
  const [data, setData] = useState<BiblePassage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        reference: reference.trim(),
        translation: translation.trim() || "web",
      });
      const response = await fetch(`/api/bible?${params.toString()}`);
      const payload = (await response.json()) as ApiResponse;

      if (!response.ok || ("error" in payload && payload.error)) {
        const message =
          "error" in payload && payload.error
            ? payload.error.message
            : "Unable to fetch passage.";
        throw new Error(message);
      }

      setData(payload.data);
    } catch (submitError) {
      setData(null);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unexpected error while fetching passage.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Bible Lookup</h1>
        <p className="text-zinc-600">
          Search a verse or passage. API responses are normalized before
          rendering.
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
          placeholder="John 3:16"
          required
          aria-label="Bible reference"
        />
        <input
          value={translation}
          onChange={(event) => setTranslation(event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 sm:max-w-32"
          placeholder="web"
          aria-label="Translation"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {isLoading ? "Loading..." : "Fetch"}
        </button>
      </form>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      ) : null}

      {!error && !isLoading && !data ? (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-600">
          Enter a reference and click fetch to load verses.
        </div>
      ) : null}

      {data ? (
        <article className="space-y-4 rounded-md border border-zinc-200 p-4">
          <div className="text-sm text-zinc-500">
            {data.reference} ({data.translation.toUpperCase()})
          </div>
          <ul className="space-y-3">
            {data.verses.map((verse) => (
              <li key={verse.reference} className="text-zinc-900">
                <span className="mr-2 font-semibold">
                  {verse.chapter}:{verse.verse}
                </span>
                <span>{verse.text}</span>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
