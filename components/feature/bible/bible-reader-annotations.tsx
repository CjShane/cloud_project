"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { NormalizedPassage } from "@/lib/normalize/bible";
import type { HighlightNote } from "@/lib/storage/reader-notes";
import { getReaderNotes, setReaderNotes } from "@/lib/storage/reader-notes";
import { setReaderProgress } from "@/lib/storage/reader-progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type BibleReaderAnnotationsProps = {
  bookId: string;
  bookName: string;
  chapter: number;
  translation: string;
  passage: NormalizedPassage;
  allowProgressSave: boolean;
};

type SelectionDraft = {
  startVerse: number;
  endVerse: number;
  startOffset: number;
  endOffset: number;
  text: string;
  position: { top: number; left: number };
};

type HighlightRange = { start: number; end: number };

function getVerseElement(node: Node | null): HTMLElement | null {
  if (!node) return null;
  const element = node instanceof HTMLElement ? node : node.parentElement;
  if (!element) return null;
  return element.closest("[data-verse]") as HTMLElement | null;
}

function getOffsetWithin(root: HTMLElement, container: Node, offset: number) {
  const range = document.createRange();
  range.setStart(root, 0);
  range.setEnd(container, offset);
  return range.toString().length;
}

function buildHighlightRanges(
  verseNumber: number,
  verseText: string,
  notes: HighlightNote[],
) {
  const ranges: HighlightRange[] = [];

  notes.forEach((note) => {
    if (verseNumber < note.startVerse || verseNumber > note.endVerse) return;
    let start = 0;
    let end = verseText.length;

    if (verseNumber === note.startVerse) {
      start = note.startOffset;
    }

    if (verseNumber === note.endVerse) {
      end = note.endOffset;
    }

    start = Math.max(0, Math.min(start, verseText.length));
    end = Math.max(start, Math.min(end, verseText.length));

    ranges.push({ start, end });
  });

  ranges.sort((a, b) => a.start - b.start);

  const merged: HighlightRange[] = [];
  ranges.forEach((range) => {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) {
      merged.push({ ...range });
      return;
    }
    last.end = Math.max(last.end, range.end);
  });

  return merged;
}

function splitTextWithHighlights(text: string, ranges: HighlightRange[]) {
  if (!ranges.length) {
    return [
      {
        text,
        highlighted: false,
        key: "0-plain",
      },
    ];
  }

  const parts: Array<{ text: string; highlighted: boolean }> = [];
  let cursor = 0;

  ranges.forEach((range) => {
    if (cursor < range.start) {
      parts.push({ text: text.slice(cursor, range.start), highlighted: false });
    }
    parts.push({ text: text.slice(range.start, range.end), highlighted: true });
    cursor = range.end;
  });

  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), highlighted: false });
  }

  return parts.map((part, index) => ({
    ...part,
    key: `${index}-${part.highlighted ? "hl" : "plain"}`,
  }));
}

function createNoteId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function BibleReaderAnnotations({
  bookId,
  bookName,
  chapter,
  translation,
  passage,
  allowProgressSave,
}: BibleReaderAnnotationsProps) {
  const reference = passage.reference || `${bookName} ${chapter}`;
  const [notes, setNotes] = useState<HighlightNote[]>(() => getReaderNotes());
  const [selection, setSelection] = useState<SelectionDraft | null>(null);
  const [draftNote, setDraftNote] = useState<SelectionDraft | null>(null);
  const [draftText, setDraftText] = useState("");
  const passageRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!allowProgressSave) return;
    setReaderProgress({ bookId, chapter, translation });
  }, [bookId, chapter, translation, allowProgressSave]);

  const chapterNotes = useMemo(() => {
    return notes.filter(
      (note) =>
        note.bookId === bookId &&
        note.chapter === chapter &&
        note.translation === translation,
    );
  }, [notes, bookId, chapter, translation]);

  function commitNotes(updater: (prev: HighlightNote[]) => HighlightNote[]) {
    setNotes((prev) => {
      const next = updater(prev);
      setReaderNotes(next);
      return next;
    });
  }

  function clearSelection() {
    setSelection(null);
    const activeSelection = window.getSelection();
    if (activeSelection?.rangeCount) {
      activeSelection.removeAllRanges();
    }
  }

  function handleCreateNote(noteText: string, selectionDraft: SelectionDraft) {
    const now = Date.now();
    const payload: HighlightNote = {
      id: createNoteId(),
      bookId,
      chapter,
      translation,
      startVerse: selectionDraft.startVerse,
      endVerse: selectionDraft.endVerse,
      startOffset: selectionDraft.startOffset,
      endOffset: selectionDraft.endOffset,
      text: selectionDraft.text,
      note: noteText,
      createdAt: now,
      updatedAt: now,
    };

    commitNotes((prev) => [...prev, payload]);
  }

  function handleMouseUp() {
    const activeSelection = window.getSelection();
    if (!activeSelection || activeSelection.isCollapsed) {
      setSelection(null);
      return;
    }

    const range = activeSelection.getRangeAt(0);
    const container = passageRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) {
      return;
    }

    const startVerseEl = getVerseElement(range.startContainer);
    const endVerseEl = getVerseElement(range.endContainer);
    if (!startVerseEl || !endVerseEl) {
      return;
    }

    const startVerse = Number(startVerseEl.dataset.verse);
    const endVerse = Number(endVerseEl.dataset.verse);

    if (!Number.isFinite(startVerse) || !Number.isFinite(endVerse)) {
      return;
    }

    let startOffset = getOffsetWithin(
      startVerseEl,
      range.startContainer,
      range.startOffset,
    );
    let endOffset = getOffsetWithin(
      endVerseEl,
      range.endContainer,
      range.endOffset,
    );
    let normalizedStartVerse = startVerse;
    let normalizedEndVerse = endVerse;

    if (
      normalizedStartVerse > normalizedEndVerse ||
      (normalizedStartVerse === normalizedEndVerse && startOffset > endOffset)
    ) {
      [normalizedStartVerse, normalizedEndVerse] = [
        normalizedEndVerse,
        normalizedStartVerse,
      ];
      [startOffset, endOffset] = [endOffset, startOffset];
    }

    const selectedText = activeSelection.toString().replace(/\s+/g, " ").trim();
    if (!selectedText) {
      return;
    }

    const rect = range.getBoundingClientRect();
    setSelection({
      startVerse: normalizedStartVerse,
      endVerse: normalizedEndVerse,
      startOffset,
      endOffset,
      text: selectedText,
      position: {
        top: Math.max(rect.top - 56, 12),
        left: rect.left + rect.width / 2,
      },
    });
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        clearSelection();
        setDraftNote(null);
        setDraftText("");
      }
    }

    function handleScroll() {
      if (selection) {
        clearSelection();
      }
    }

    window.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [selection]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <article className="space-y-4 rounded-md border border-border bg-card p-5 lg:max-h-[70vh] lg:overflow-y-auto">
          <div className="text-sm text-muted-foreground">
            {reference} ({translation.toUpperCase()})
          </div>
          <div
            ref={passageRef}
            className="space-y-4 font-serif text-foreground leading-8"
            onMouseUp={handleMouseUp}
          >
            {(() => {
              const groups: typeof passage.verses[] = [];
              passage.verses.forEach((verse, index) => {
                const groupIndex = Math.floor(index / 5);
                if (!groups[groupIndex]) {
                  groups[groupIndex] = [];
                }
                groups[groupIndex].push(verse);
              });

              return groups.map((group, groupIndex) => (
                <p key={`${reference}-${groupIndex}`}>
                  {group.map((verse, index) => {
                    const ranges = buildHighlightRanges(
                      verse.verse,
                      verse.text,
                      chapterNotes,
                    );
                    const parts = splitTextWithHighlights(verse.text, ranges);

                    return (
                      <span key={verse.reference} className="select-text">
                        <sup className="mr-1 select-none text-sm font-semibold text-primary">
                          {verse.verse}
                        </sup>
                        <span data-verse={verse.verse}>
                          {parts.map((part) =>
                            part.highlighted ? (
                              <mark
                                key={part.key}
                                className="rounded-sm bg-primary/15 px-0.5 text-foreground"
                              >
                                {part.text}
                              </mark>
                            ) : (
                              <span key={part.key}>{part.text}</span>
                            ),
                          )}
                        </span>
                        {index < group.length - 1 ? " " : ""}
                      </span>
                    );
                  })}
                </p>
              ));
            })()}
          </div>
        </article>

        <div className="lg:sticky lg:top-6">
          <NotesPanel
          bookName={bookName}
          chapter={chapter}
          notes={chapterNotes}
          draftNote={draftNote}
          draftText={draftText}
          onDraftTextChange={setDraftText}
          onSaveDraft={() => {
            if (!draftNote) return;
            handleCreateNote(draftText.trim(), draftNote);
            setDraftNote(null);
            setDraftText("");
          }}
          onCancelDraft={() => {
            setDraftNote(null);
            setDraftText("");
          }}
          onUpdateNote={(id, noteText) => {
            const now = Date.now();
            commitNotes((prev) =>
              prev.map((note) =>
                note.id === id ? { ...note, note: noteText, updatedAt: now } : note,
              ),
            );
          }}
          onDeleteNote={(id) => {
            commitNotes((prev) => prev.filter((note) => note.id !== id));
          }}
          />
        </div>
      </div>

      {selection ? (
        <div
          className="fixed z-40 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm shadow-md"
          style={{
            top: `${selection.position.top}px`,
            left: `${selection.position.left}px`,
            transform: "translateX(-50%)",
          }}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              handleCreateNote("", selection);
              setDraftNote(null);
              setDraftText("");
              clearSelection();
            }}
          >
            Highlight
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setDraftNote(selection);
              setDraftText("");
              clearSelection();
            }}
          >
            Add Note
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            Cancel
          </Button>
        </div>
      ) : null}
    </div>
  );
}

type NotesPanelProps = {
  bookName: string;
  chapter: number;
  notes: HighlightNote[];
  draftNote: SelectionDraft | null;
  draftText: string;
  onDraftTextChange: (value: string) => void;
  onSaveDraft: () => void;
  onCancelDraft: () => void;
  onUpdateNote: (id: string, noteText: string) => void;
  onDeleteNote: (id: string) => void;
};

function NotesPanel({
  bookName,
  chapter,
  notes,
  draftNote,
  draftText,
  onDraftTextChange,
  onSaveDraft,
  onCancelDraft,
  onUpdateNote,
  onDeleteNote,
}: NotesPanelProps) {
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
  const previewLimit = 180;
  const buildPreview = (text: string) =>
    text.length > previewLimit ? `${text.slice(0, previewLimit)}…` : text;

  return (
    <aside className="flex max-h-[70vh] flex-col gap-3 rounded-md border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Notes</h3>
          <p className="text-xs text-muted-foreground">
            {bookName} {chapter}
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          {notes.length}
        </span>
      </div>

      {draftNote ? (
        <div className="rounded-md border border-dashed border-border bg-secondary/30 p-3 text-sm">
          <div className="text-xs font-semibold text-muted-foreground">
            New note
          </div>
          <p className="mt-2 text-sm text-foreground">{draftNote.text}</p>
          <Textarea
            value={draftText}
            onChange={(event) => onDraftTextChange(event.target.value)}
            placeholder="Write a note..."
            className="mt-3 min-h-[90px] text-sm"
          />
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onClick={onSaveDraft}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelDraft}>
              Cancel
            </Button>
          </div>
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-secondary/20 px-3 py-3 text-xs text-muted-foreground">
          Select text to add a highlight or note.
        </div>
      ) : null}

      <ScrollArea className="flex-1 pr-2">
        <div className="space-y-3">
          {sortedNotes.length === 0 ? (
            <div className="rounded-md border border-border bg-background px-3 py-4 text-sm text-muted-foreground">
              No notes yet for this chapter.
            </div>
          ) : null}

          {sortedNotes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "rounded-md border border-border bg-background p-3 text-sm",
                note.note ? "space-y-2" : "space-y-3",
              )}
            >
              <button
                type="button"
                onClick={() => router.push(`/notes?note=${note.id}`)}
                className="text-left"
              >
                <p className="text-xs text-muted-foreground">
                  {buildPreview(note.text)}
                </p>
              </button>
              <Textarea
                value={note.note}
                onChange={(event) => onUpdateNote(note.id, event.target.value)}
                placeholder="Add a note..."
                className="min-h-[72px] text-sm"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {new Date(note.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => onDeleteNote(note.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
