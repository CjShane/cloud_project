import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import {
  getLocalTranslations,
  getLocalTranslationsForBook,
} from "@/lib/bible/local-bibles";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const bookId = url.searchParams.get("book");
  const translations = bookId
    ? await getLocalTranslationsForBook(bookId)
    : await getLocalTranslations();
  return NextResponse.json({
    data: translations.map((translation) => ({
      id: translation.id,
      label: translation.label,
      language: translation.language,
      name: translation.name,
    })),
  });
}
