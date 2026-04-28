"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  setReaderNotes,
  type HighlightNote,
} from "@/lib/storage/reader-notes";
import {
  loadReaderNotes,
  updateReaderNoteInAccount,
} from "@/lib/storage/reader-sync";
import { BOOKS } from "@/lib/bible/books";
import { NotesCard } from "@/components/feature/notes/notes-card";
import { TranslationSelect } from "@/components/feature/bible/translation-select";

type NotesByBook = {
  bookId: string;
  bookName: string;
  notes: HighlightNote[];
};

function groupNotesByBook(notes: HighlightNote[]) {
  const bookMap = new Map<string, HighlightNote[]>();
  notes.forEach((note) => {
    const entry = bookMap.get(note.bookId) ?? [];
    entry.push(note);
    bookMap.set(note.bookId, entry);
  });

  const bookLookup = new Map(BOOKS.map((book) => [book.id, book.name]));

  const grouped: NotesByBook[] = [];
  bookMap.forEach((bookNotes, bookId) => {
    const bookName = bookLookup.get(bookId) ?? bookId;
    grouped.push({
      bookId,
      bookName,
      notes: [...bookNotes].sort((a, b) => b.updatedAt - a.updatedAt),
    });
  });

  grouped.sort((a, b) => a.bookName.localeCompare(b.bookName));
  return grouped;
}

function NotesPageContent() {
  const searchParams = useSearchParams();
  const focusedNoteId = searchParams.get("note") ?? "";
  const [notes, setNotes] = useState<HighlightNote[]>([]);
  const focusedTimer = useRef<number | null>(null);
  const [activeFocus, setActiveFocus] = useState<string>(focusedNoteId);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState("all");
  const [selectedTranslation, setSelectedTranslation] = useState("all");

  useEffect(() => {
    let active = true;
    loadReaderNotes().then((loadedNotes) => {
      if (active) {
        setNotes(loadedNotes);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
    if (!focusedNoteId) {
      setActiveFocus("");
      return;
    }

    setActiveFocus(focusedNoteId);
    const target = document.querySelector(
      `[data-note-id="${focusedNoteId}"]`,
    ) as HTMLElement | null;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (focusedTimer.current) {
      window.clearTimeout(focusedTimer.current);
    }
    focusedTimer.current = window.setTimeout(() => {
      setActiveFocus("");
    }, 2500);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      if (focusedTimer.current) {
        window.clearTimeout(focusedTimer.current);
      }
    };
  }, [focusedNoteId]);

  const translations = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((note) => {
      if (note.translation) {
        set.add(note.translation.toLowerCase());
      }
    });
    return Array.from(set).sort();
  }, [notes]);
  const translationOptions = useMemo(
    () => [
      { label: "All", value: "all" },
      ...translations.map((translation) => ({
        label: translation.toUpperCase(),
        value: translation,
      })),
    ],
    [translations],
  );

  const filteredNotes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return notes.filter((note) => {
      if (selectedBook !== "all" && note.bookId !== selectedBook) {
        return false;
      }
      if (
        selectedTranslation !== "all" &&
        note.translation.toLowerCase() !== selectedTranslation
      ) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }
      const haystack = `${note.text} ${note.note}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [notes, searchTerm, selectedBook, selectedTranslation]);

  const grouped = useMemo(
    () => groupNotesByBook(filteredNotes),
    [filteredNotes],
  );
  const handleUpdateNote = (id: string, value: string) => {
    setNotes((prev) => {
      const now = Date.now();
      const next = prev.map((note) =>
        note.id === id ? { ...note, note: value, updatedAt: now } : note,
      );
      setReaderNotes(next);
      void updateReaderNoteInAccount(id, value);
      return next;
    });
  };

  if (notes.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Notes
        </h1>
        <p className="text-muted-foreground">
          Your notes will appear here once you start highlighting scripture.
        </p>
        <Link
          href="/bible"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Start reading
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Notes
        </h1>
        <p className="text-muted-foreground">
          Review highlights and notes grouped by book.
        </p>
      </header>

      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Search
            </label>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search highlights or notes..."
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div className="flex gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Book
              </label>
              <select
                value={selectedBook}
                onChange={(event) => setSelectedBook(event.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All</option>
                {BOOKS.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Translation
              </label>
              <div className="mt-1">
                <TranslationSelect
                  value={selectedTranslation}
                  onChange={setSelectedTranslation}
                  options={translationOptions}
                  placeholder="Translation"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedBook("all");
              setSelectedTranslation("all");
            }}
            className="text-sm font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-md border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
          No saved notes match this filter yet.
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map((group) => (
            <section key={group.bookId} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                {group.bookName}
              </h2>
              <div className="space-y-4">
                {group.notes.map((note) => (
                  <NotesCard
                    key={note.id}
                    note={note}
                    bookName={group.bookName}
                    isFocused={note.id === activeFocus}
                    onUpdateNote={handleUpdateNote}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

export default function NotesPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto w-full max-w-5xl px-4 py-10 text-sm text-muted-foreground sm:px-6 lg:px-8">
          Loading notes...
        </section>
      }
    >
      <NotesPageContent />
    </Suspense>
  );
}

