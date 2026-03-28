import type { NormalizedPassage } from "@/lib/normalize/bible";
import {
  getLocalChapterPassage,
  getLocalPassage,
} from "@/lib/bible/local-bibles";

export async function fetchBiblePassage(
  reference: string,
  translation = "web",
): Promise<NormalizedPassage> {
  return getLocalPassage(reference, translation);
}

export async function fetchBibleChapter(
  bookId: string,
  chapter: number,
  translation = "web",
): Promise<NormalizedPassage> {
  return getLocalChapterPassage(bookId, chapter, translation);
}
