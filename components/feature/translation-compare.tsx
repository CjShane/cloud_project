"use client";

import { FormEvent, useState } from "react";

type Verse = {
  reference: string;
  chapter: number;
  verse: number;
  text: string;
};

type Passage = {
  reference: string;
  translation: string;
  verses: Verse[];
};

type CompareData = {
  reference: string;
  primary: Passage;
  secondary: Passage;
};

type CompareResponse =
  | {
      data: CompareData;
      error?: never;
    }
  | {
      data?: never;
      error: {
        code: string;
        message: string;
      };
    };

export function TranslationCompare() {
  const [reference, setReference] = useState("John 3:16");
  const [primary, setPrimary] = useState("web");
  const [secondary, setSecondary] = useState("kjv");
  const [data, setData] = useState<CompareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        reference: reference.trim(),
        primary: primary.trim() || "web",
        secondary: secondary.trim() || "kjv",
      });
      const response = await fetch(`/api/compare?${params.toString()}`);
      const payload = (await response.json()) as CompareResponse;

      if (!response.ok || ("error" in payload && payload.error)) {
        const message =
          "error" in payload && payload.error
            ? payload.error.message
            : "Unable to compare translations.";
        throw new Error(message);
      }

      setData(payload.data);
    } catch (submitError) {
      setData(null);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unexpected error while comparing translations.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Translation Compare
        </h1>
        <p className="text-zinc-600">
          Compare the same passage in two translations side by side.
        </p>
      </header>

      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-4">
        <input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 md:col-span-2"
          placeholder="John 3:16"
          aria-label="Reference"
          required
        />
        <input
          value={primary}
          onChange={(event) => setPrimary(event.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2"
          placeholder="web"
          aria-label="Primary translation"
        />
        <input
          value={secondary}
          onChange={(event) => setSecondary(event.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2"
          placeholder="kjv"
          aria-label="Secondary translation"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white md:col-span-4"
          disabled={isLoading}
        >
          {isLoading ? "Comparing..." : "Compare"}
        </button>
      </form>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      ) : null}

      {!error && !isLoading && !data ? (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-600">
          Enter a reference and compare translations.
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="space-y-3 rounded-md border border-zinc-200 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {data.primary.translation}
            </h2>
            <ul className="space-y-2">
              {data.primary.verses.map((verse) => (
                <li key={`primary-${verse.reference}`}>
                  <span className="mr-2 font-semibold">
                    {verse.chapter}:{verse.verse}
                  </span>
                  <span>{verse.text}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="space-y-3 rounded-md border border-zinc-200 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {data.secondary.translation}
            </h2>
            <ul className="space-y-2">
              {data.secondary.verses.map((verse) => (
                <li key={`secondary-${verse.reference}`}>
                  <span className="mr-2 font-semibold">
                    {verse.chapter}:{verse.verse}
                  </span>
                  <span>{verse.text}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      ) : null}
    </section>
  );
}
