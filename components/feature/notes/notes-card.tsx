"use client";

import Link from "next/link";
import type { HighlightNote } from "@/lib/storage/reader-notes";
import { cn } from "@/lib/utils";

type NotesCardProps = {
  note: HighlightNote;
  bookName: string;
  isFocused?: boolean;
  onUpdateNote?: (id: string, value: string) => void;
};

const PREVIEW_LIMIT = 180;

function buildPreview(text: string) {
  return text.length > PREVIEW_LIMIT ? `${text.slice(0, PREVIEW_LIMIT)}...` : text;
}

function buildReference(note: HighlightNote, bookName: string) {
  const range =
    note.startVerse === note.endVerse
      ? `${note.startVerse}`
      : `${note.startVerse}-${note.endVerse}`;
  return `${bookName} ${note.chapter}:${range}`;
}

export function NotesCard({
  note,
  bookName,
  isFocused,
  onUpdateNote,
}: NotesCardProps) {
  const reference = buildReference(note, bookName);

  return (
    <article
      data-note-id={note.id}
      className={cn(
        "rounded-md border border-border bg-card p-4 transition",
        isFocused ? "ring-2 ring-primary/60" : "hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-foreground">{reference}</div>
          <p className="mt-2 text-sm text-muted-foreground">
            {buildPreview(note.text)}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(note.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="mt-3">
        {onUpdateNote ? (
          <textarea
            value={note.note}
            onChange={(event) => onUpdateNote(note.id, event.target.value)}
            placeholder="Add a note..."
            className="min-h-[96px] w-full rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        ) : (
          <div className="rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground">
            {note.note ? note.note : "No note text yet."}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{note.translation.toUpperCase()}</span>
        <Link
          href={`/bible?book=${note.bookId}&chapter=${note.chapter}&translation=${note.translation}`}
          className="text-primary hover:underline"
        >
          Open in reader
        </Link>
      </div>
    </article>
  );
}
