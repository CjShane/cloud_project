import { fetchBiblePassage } from "@/lib/api/bible-api";
import type { NormalizedPassage } from "@/lib/normalize/bible";

export type ComparedPassages = {
  reference: string;
  primary: NormalizedPassage;
  secondary: NormalizedPassage;
};

export async function fetchComparedPassages(
  reference: string,
  primaryTranslation = "web",
  secondaryTranslation = "kjv",
): Promise<ComparedPassages> {
  const [primary, secondary] = await Promise.all([
    fetchBiblePassage(reference, primaryTranslation),
    fetchBiblePassage(reference, secondaryTranslation),
  ]);

  return {
    reference,
    primary,
    secondary,
  };
}
