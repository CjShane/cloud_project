import { type NextRequest } from "next/server";
import {
  deleteReaderNote,
  updateReaderNoteText,
} from "@/lib/reader/db";
import { jsonData, jsonError } from "@/lib/api/http";
import { requireUserFromRequest, UnauthorizedError } from "@/lib/auth/session";

type NoteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: NoteParams) {
  try {
    const user = await requireUserFromRequest(request);
    const { id } = await params;
    const body = (await request.json()) as { note?: unknown };
    if (typeof body.note !== "string") {
      return jsonError("INVALID_NOTE", "Note text must be a string.", 400);
    }

    const found = await updateReaderNoteText(user.id, id, body.note);
    if (!found) {
      return jsonError("NOT_FOUND", "Note not found.", 404);
    }

    return jsonData({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("UNAUTHORIZED", error.message, 401);
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest, { params }: NoteParams) {
  try {
    const user = await requireUserFromRequest(request);
    const { id } = await params;
    const found = await deleteReaderNote(user.id, id);
    if (!found) {
      return jsonError("NOT_FOUND", "Note not found.", 404);
    }

    return jsonData({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("UNAUTHORIZED", error.message, 401);
    }
    throw error;
  }
}
