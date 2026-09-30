/**
 * Pages a signed-out visitor may be sent back to after signing in. An
 * allowlist (not "any relative path") so the `np_return_to` cookie can never
 * be turned into an open redirect or a bounce to an unrelated route.
 */
const RETURN_PATH_PATTERN = /^\/(?:cart|account|checkout\/[\w-]+|r\/[\w-]+)$/

/** `value` when it is an allowed in-app path, otherwise null. */
export function safeReturnPath(
  value: string | null | undefined
): string | null {
  return value && RETURN_PATH_PATTERN.test(value) ? value : null
}
