import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

import { completeGoogleSignIn } from "@/features/auth/google-callback"

/** Where Google redirects after the consent screen (`GOOGLE_REDIRECT_URI`). */
export async function GET(request: NextRequest) {
  redirect(await completeGoogleSignIn(request.nextUrl.searchParams))
}
