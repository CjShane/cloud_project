import { fetchBiblePassage } from "@/lib/api/bible-api";
import { AppError, type AppErrorCode } from "@/lib/errors/app-error";
import { NextResponse } from "next/server";

function statusForErrorCode(code: AppErrorCode): number {
  switch (code) {
    case "NOT_FOUND":
      return 404;
    case "RATE_LIMITED":
      return 429;
    case "INVALID_RESPONSE":
      return 502;
    case "UPSTREAM_UNAVAILABLE":
    case "NETWORK_ERROR":
      return 503;
    default:
      return 500;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference")?.trim();
  const translation = searchParams.get("translation")?.trim() || "web";

  if (!reference) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REFERENCE",
          message: "Query parameter 'reference' is required.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const data = await fetchBiblePassage(reference, translation);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: statusForErrorCode(error.code) },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "UNKNOWN",
          message: "Unexpected error.",
        },
      },
      { status: 500 },
    );
  }
}
