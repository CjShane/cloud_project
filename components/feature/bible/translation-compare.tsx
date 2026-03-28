"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TranslationSelect } from "@/components/feature/bible/translation-select";
import { resolveBookId } from "@/lib/bible/resolve-book-id";

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
  const searchParams = useSearchParams();
  const [reference, setReference] = useState("John 3:16");
  const [primary, setPrimary] = useState("web");
  const [secondary, setSecondary] = useState("kjv");
  const [data, setData] = useState<CompareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const bookId = useMemo(() => resolveBookId(reference), [reference]);

  const fetchCompare = useCallback(
    async (nextReference: string, nextPrimary: string, nextSecondary: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        reference: nextReference.trim(),
        primary: nextPrimary.trim() || "web",
        secondary: nextSecondary.trim() || "kjv",
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
    },
    [],
  );

  useEffect(() => {
    const referenceParam = searchParams.get("reference");
    const primaryParam = searchParams.get("primary");
    const secondaryParam = searchParams.get("secondary");
    if (!referenceParam) {
      return;
    }
    const nextPrimary = primaryParam ?? "web";
    const nextSecondary = secondaryParam ?? "kjv";
    setReference(referenceParam);
    setPrimary(nextPrimary);
    setSecondary(nextSecondary);
    fetchCompare(referenceParam, nextPrimary, nextSecondary);
  }, [fetchCompare, searchParams]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetchCompare(reference, primary, secondary);
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Translation Compare
        </h1>
        <p className="text-muted-foreground">
          Compare the same passage in two translations side by side.
        </p>
      </header>

      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-4">
        <Input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          className="md:col-span-2"
          placeholder="John 3:16"
          aria-label="Reference"
          required
        />
        <TranslationSelect
          value={primary}
          onChange={setPrimary}
          placeholder="Primary"
          bookId={bookId ?? undefined}
        />
        <TranslationSelect
          value={secondary}
          onChange={setSecondary}
          placeholder="Secondary"
          bookId={bookId ?? undefined}
        />
        <Button
          type="submit"
          className="md:col-span-4"
          disabled={isLoading}
        >
          {isLoading ? "Comparing..." : "Compare"}
        </Button>
      </form>

      {error ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive">
          {error}
        </div>
      ) : null}

      {!error && !isLoading && !data ? (
        <div className="rounded-md border border-border bg-card px-4 py-3 text-muted-foreground">
          Enter a reference and compare translations.
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="space-y-3 rounded-md border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {data.primary.translation}
            </h2>
            <ul className="space-y-2 font-serif text-foreground">
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

          <article className="space-y-3 rounded-md border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {data.secondary.translation}
            </h2>
            <ul className="space-y-2 font-serif text-foreground">
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

