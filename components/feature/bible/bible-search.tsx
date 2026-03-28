"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TranslationSelect } from "@/components/feature/bible/translation-select";
import { resolveBookId } from "@/lib/bible/resolve-book-id";

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
  const searchParams = useSearchParams();
  const [reference, setReference] = useState("John 3:16");
  const [translation, setTranslation] = useState("web");
  const [data, setData] = useState<BiblePassage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const bookId = useMemo(() => resolveBookId(reference), [reference]);

  const fetchPassage = useCallback(
    async (nextReference: string, nextTranslation: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        reference: nextReference.trim(),
        translation: nextTranslation.trim() || "web",
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
    },
    [],
  );

  useEffect(() => {
    const referenceParam = searchParams.get("reference");
    const translationParam = searchParams.get("translation");
    if (!referenceParam) {
      return;
    }
    const nextTranslation = translationParam ?? "web";
    setReference(referenceParam);
    setTranslation(nextTranslation);
    fetchPassage(referenceParam, nextTranslation);
  }, [fetchPassage, searchParams]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetchPassage(reference, translation);
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Bible Lookup</h1>
        <p className="text-muted-foreground">
          Search a verse or passage. API responses are normalized before
          rendering.
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="John 3:16"
          required
          aria-label="Bible reference"
        />
        <div className="sm:max-w-40">
          <TranslationSelect
            value={translation}
            onChange={setTranslation}
            placeholder="Translation"
            bookId={bookId ?? undefined}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Fetch"}
        </Button>
      </form>

      {error ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive">
          {error}
        </div>
      ) : null}

      {!error && !isLoading && !data ? (
        <div className="rounded-md border border-border bg-card px-4 py-3 text-muted-foreground">
          Enter a reference and click fetch to load verses.
        </div>
      ) : null}

      {data ? (
        <article className="space-y-4 rounded-md border border-border bg-card p-4">
          <div className="text-sm text-muted-foreground">
            {data.reference} ({data.translation.toUpperCase()})
          </div>
          <ul className="space-y-3 font-serif">
            {data.verses.map((verse) => (
              <li key={verse.reference} className="text-foreground">
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

