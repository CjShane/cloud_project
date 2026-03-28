import {
  type NormalizedPassage,
} from "@/lib/normalize/bible";
import {
  getDeterministicLocalVerse,
  getLocalPassage,
  getRandomLocalVerse,
} from "@/lib/bible/local-bibles";

const DAILY_FALLBACK_REFERENCE = "Psalm 23:1";

export type DailyVerseResult = {
  passage: NormalizedPassage;
  source: "live" | "fallback";
};

export async function fetchRandomVerse(
  translation = "web",
): Promise<NormalizedPassage> {
  return getRandomLocalVerse(translation);
}

export async function fetchDailyVerse(
  translation = "web",
): Promise<DailyVerseResult> {
  try {
    const dateKey = new Date().toISOString().slice(0, 10);
    const passage = await getDeterministicLocalVerse(
      translation,
      `daily:${dateKey}`,
    );
    return {
      passage,
      source: "live",
    };
  } catch {
    return {
      passage: await getLocalPassage(DAILY_FALLBACK_REFERENCE, translation),
      source: "fallback",
    };
  }
}
