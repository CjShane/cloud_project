import { type NextRequest } from "next/server";
import {
  getReaderProgressForUser,
  upsertReaderProgress,
} from "@/lib/reader/db";
import { normalizeReaderProgress } from "@/lib/reader/normalize";
import { jsonData, jsonError } from "@/lib/api/http";
import { requireUserFromRequest, UnauthorizedError } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUserFromRequest(request);
    return jsonData({ progress: await getReaderProgressForUser(user.id) });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("UNAUTHORIZED", error.message, 401);
    }
    throw error;
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUserFromRequest(request);
    const body = (await request.json()) as { progress?: unknown };
    const progress = normalizeReaderProgress(body.progress);
    if (!progress) {
      return jsonError("INVALID_PROGRESS", "A valid progress payload is required.", 400);
    }

    await upsertReaderProgress(user.id, progress);
    return jsonData({ progress });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("UNAUTHORIZED", error.message, 401);
    }
    throw error;
  }
}
