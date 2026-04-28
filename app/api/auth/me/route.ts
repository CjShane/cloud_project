import { type NextRequest } from "next/server";
import { currentUserFromRequest } from "@/lib/auth/session";
import { jsonData } from "@/lib/api/http";

export async function GET(request: NextRequest) {
  const user = await currentUserFromRequest(request);
  return jsonData({
    user: user
      ? {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        }
      : null,
  });
}
