import { fetchJson } from "@/lib/api/fetch-json";
import {
  type BibleApiPassageRaw,
  type NormalizedPassage,
  normalizeBiblePassage,
} from "@/lib/normalize/bible";

const BIBLE_API_BASE_URL = process.env.BIBLE_API_BASE_URL ?? "https://bible-api.com";
const DAILY_FALLBACK_REFERENCE = "Psalm 23:1";

export type DailyVerseResult = {
  passage: NormalizedPassage;
  source: "live" | "fallback";
};

export async function fetchRandomVerse(
  translation = "web",
): Promise<NormalizedPassage> {
  const encodedTranslation = encodeURIComponent(translation);
  const url = `${BIBLE_API_BASE_URL}/data/${encodedTranslation}/random`;
  const raw = await fetchJson<BibleApiPassageRaw>(url);

  return normalizeBiblePassage(raw, translation);
}

export async function fetchDailyVerse(
  translation = "web",
): Promise<DailyVerseResult> {
  try {
    const passage = await fetchRandomVerse(translation);
    return {
      passage,
      source: "live",
    };
  } catch {
    const fallbackPassage = await fetchJson<BibleApiPassageRaw>(
      `${BIBLE_API_BASE_URL}/${encodeURIComponent(DAILY_FALLBACK_REFERENCE)}?translation=${encodeURIComponent(translation)}`,
    );

    return {
      passage: normalizeBiblePassage(fallbackPassage, translation),
      source: "fallback",
    };
  }
}
