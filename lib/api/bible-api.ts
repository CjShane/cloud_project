import { fetchJson } from "@/lib/api/fetch-json";
import {
  type BibleApiPassageRaw,
  normalizeBiblePassage,
  type NormalizedPassage,
} from "@/lib/normalize/bible";

const BIBLE_API_BASE_URL = process.env.BIBLE_API_BASE_URL ?? "https://bible-api.com";

export async function fetchBiblePassage(
  reference: string,
  translation = "web",
): Promise<NormalizedPassage> {
  const encodedReference = encodeURIComponent(reference);
  const encodedTranslation = encodeURIComponent(translation);
  const url = `${BIBLE_API_BASE_URL}/${encodedReference}?translation=${encodedTranslation}`;
  const raw = await fetchJson<BibleApiPassageRaw>(url);

  return normalizeBiblePassage(raw, translation);
}
