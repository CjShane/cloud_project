"use client";

import { useEffect, useState } from "react";
export type TranslationOption = {
  id: string;
  label: string;
  language?: string;
  name?: string;
};

const cachedTranslations = new Map<string, TranslationOption[]>();
const pendingRequests = new Map<string, Promise<TranslationOption[]>>();

async function fetchTranslations(bookId?: string) {
  const params = new URLSearchParams();
  if (bookId) {
    params.set("book", bookId);
  }
  const url = params.toString()
    ? `/api/translations?${params.toString()}`
    : "/api/translations";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to load translations.");
  }
  const payload = (await response.json()) as { data?: TranslationOption[] };
  return payload.data ?? [];
}

export function useTranslations(bookId?: string) {
  const cacheKey = (bookId || "all").toLowerCase();
  const [data, setData] = useState<TranslationOption[]>(
    cachedTranslations.get(cacheKey) ?? [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    !cachedTranslations.has(cacheKey),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedTranslations.has(cacheKey)) {
      setData(cachedTranslations.get(cacheKey) ?? []);
      setIsLoading(false);
      return;
    }

    if (!pendingRequests.has(cacheKey)) {
      pendingRequests.set(cacheKey, fetchTranslations(bookId));
    }

    const pending = pendingRequests.get(cacheKey) as Promise<
      TranslationOption[]
    >;
    pending
      .then((translations) => {
        cachedTranslations.set(cacheKey, translations);
        setData(translations);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load translations.");
        setIsLoading(false);
      });
  }, [bookId, cacheKey]);

  return { data, isLoading, error };
}
