"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadReaderProgress } from "@/lib/storage/reader-sync";

type BibleReaderResumeProps = {
  hasExplicitParams: boolean;
};

export function BibleReaderResume({ hasExplicitParams }: BibleReaderResumeProps) {
  const router = useRouter();

  useEffect(() => {
    if (hasExplicitParams) {
      return;
    }

    let active = true;
    loadReaderProgress().then((progress) => {
      if (!active || !progress) {
        return;
      }

      const params = new URLSearchParams({
        book: progress.bookId,
        chapter: String(progress.chapter),
        translation: progress.translation,
      });

      router.replace(`/bible?${params.toString()}`);
    });

    return () => {
      active = false;
    };
  }, [hasExplicitParams, router]);

  return null;
}
