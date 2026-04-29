"use client";

import {
  getReaderNotes,
  setReaderNotes,
  type HighlightNote,
} from "@/lib/storage/reader-notes";
import {
  getReaderProgress,
  setReaderProgress,
  type ReaderProgress,
} from "@/lib/storage/reader-progress";
import {
  normalizeHighlightNotes,
  normalizeReaderProgress,
} from "@/lib/reader/normalize";

export type AccountUser = {
  id: string;
  email: string;
  createdAt: string;
};

const ACCOUNT_CHANGED_EVENT = "scripture-account-changed";

export class ReaderSyncError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ReaderSyncError";
  }
}

export function notifyAccountChanged() {
  window.dispatchEvent(new Event(ACCOUNT_CHANGED_EVENT));
}

export function listenForAccountChanges(listener: () => void) {
  window.addEventListener(ACCOUNT_CHANGED_EVENT, listener);
  return () => window.removeEventListener(ACCOUNT_CHANGED_EVENT, listener);
}

function mergeNotes(localNotes: HighlightNote[], remoteNotes: HighlightNote[]) {
  const byId = new Map<string, HighlightNote>();
  [...remoteNotes, ...localNotes].forEach((note) => {
    const existing = byId.get(note.id);
    if (!existing || note.updatedAt >= existing.updatedAt) {
      byId.set(note.id, note);
    }
  });
  return Array.from(byId.values()).sort((a, b) => b.updatedAt - a.updatedAt);
}

async function readData<T>(response: Response) {
  const payload = (await response.json()) as { data?: T };
  return payload.data;
}

async function expectOk(response: Response, action: string) {
  if (response.ok) {
    return true;
  }
  if (response.status === 401) {
    return false;
  }

  let message = `${action} failed with HTTP ${response.status}.`;
  try {
    const payload = (await response.json()) as {
      error?: { message?: string };
    };
    if (payload.error?.message) {
      message = payload.error.message;
    }
  } catch {}

  throw new ReaderSyncError(message, response.status);
}

export async function getCurrentAccount() {
  const response = await fetch("/api/auth/me", {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!response.ok) {
    return null;
  }
  const data = await readData<{ user: AccountUser | null }>(response);
  return data?.user ?? null;
}

export async function loadReaderNotes() {
  const localNotes = getReaderNotes();
  const response = await fetch("/api/user/notes", {
    cache: "no-store",
    credentials: "same-origin",
  });

  if (response.status === 401) {
    return localNotes;
  }
  if (!response.ok) {
    return localNotes;
  }

  const data = await readData<{ notes: unknown }>(response);
  const remoteNotes = normalizeHighlightNotes(data?.notes);
  setReaderNotes(remoteNotes);
  return remoteNotes;
}

export async function loadReaderProgress() {
  const localProgress = getReaderProgress();
  const response = await fetch("/api/user/progress", {
    cache: "no-store",
    credentials: "same-origin",
  });

  if (response.status === 401 || !response.ok) {
    return localProgress;
  }

  const data = await readData<{ progress: unknown }>(response);
  const remoteProgress = normalizeReaderProgress(data?.progress);
  if (remoteProgress) {
    setReaderProgress(remoteProgress);
  }
  return remoteProgress ?? localProgress;
}

export async function mergeLocalReaderDataToAccount() {
  const localNotes = getReaderNotes();
  const localProgress = getReaderProgress();

  const notesResponse = await fetch("/api/user/notes", {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!(await expectOk(notesResponse, "Loading notes"))) {
    return false;
  }

  if (notesResponse.ok) {
    const notesData = await readData<{ notes: unknown }>(notesResponse);
    const mergedNotes = mergeNotes(
      localNotes,
      normalizeHighlightNotes(notesData?.notes),
    );
    const saveNotesResponse = await fetch("/api/user/notes", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: mergedNotes }),
    });
    if (!(await expectOk(saveNotesResponse, "Saving notes"))) {
      return false;
    }
    setReaderNotes(mergedNotes);
  }

  if (localProgress) {
    return saveReaderProgressToAccount(localProgress);
  } else {
    await loadReaderProgress();
  }
  return true;
}

export async function saveReaderNoteToAccount(note: HighlightNote) {
  const response = await fetch("/api/user/notes", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  return expectOk(response, "Saving note");
}

export async function updateReaderNoteInAccount(id: string, note: string) {
  const response = await fetch(`/api/user/notes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  return expectOk(response, "Updating note");
}

export async function deleteReaderNoteFromAccount(id: string) {
  const response = await fetch(`/api/user/notes/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  return expectOk(response, "Deleting note");
}

export async function saveReaderProgressToAccount(progress: ReaderProgress) {
  const response = await fetch("/api/user/progress", {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ progress }),
  });
  return expectOk(response, "Saving reading progress");
}
