import { toastManager } from "@/components/ui/toast"

const DEFAULT_ERROR_TITLE = "Something went wrong"

/** Pushes an error toast. Use from client code -- event handlers, effects,
 * error boundaries -- wherever a caught error should surface to the user. */
export function notifyError(
  message: string = "Please try again.",
  title: string = DEFAULT_ERROR_TITLE
): void {
  toastManager.add({ type: "error", title, description: message })
}
