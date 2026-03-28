"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getReaderProgress } from "@/lib/storage/reader-progress";

type BibleReaderResumeProps = {
  hasExplicitParams: boolean;
};

export function BibleReaderResume({ hasExplicitParams }: BibleReaderResumeProps) {
  const router = useRouter();

  useEffect(() => {
    if (hasExplicitParams) {
      return;
    }

    const progress = getReaderProgress();
    if (!progress) {
      return;
    }

    const params = new URLSearchParams({
      book: progress.bookId,
      chapter: String(progress.chapter),
      translation: progress.translation,
    });

    router.replace(`/bible?${params.toString()}`);
  }, [hasExplicitParams, router]);

  return null;
}
