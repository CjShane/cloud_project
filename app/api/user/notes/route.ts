import { type NextRequest } from "next/server";
import {
  getReaderNotesForUser,
  upsertReaderNote,
  upsertReaderNotes,
} from "@/lib/reader/db";
import {
  normalizeHighlightNote,
  normalizeHighlightNotes,
} from "@/lib/reader/normalize";
import { jsonData, jsonError } from "@/lib/api/http";
import { requireUserFromRequest, UnauthorizedError } from "@/lib/auth/session";

type NotesBody = {
  note?: unknown;
  notes?: unknown;
};

export async function GET(request: NextRequest) {
  try {
    const user = await requireUserFromRequest(request);
    return jsonData({ notes: await getReaderNotesForUser(user.id) });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("UNAUTHORIZED", error.message, 401);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUserFromRequest(request);
    const body = (await request.json()) as NotesBody;

    if (Array.isArray(body.notes)) {
      const notes = normalizeHighlightNotes(body.notes);
      await upsertReaderNotes(user.id, notes);
      return jsonData({ notes: await getReaderNotesForUser(user.id) });
    }

    const note = normalizeHighlightNote(body.note);
    if (!note) {
      return jsonError("INVALID_NOTE", "A valid note payload is required.", 400);
    }

    await upsertReaderNote(user.id, note);
    return jsonData({ note });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("UNAUTHORIZED", error.message, 401);
    }
    throw error;
  }
}
