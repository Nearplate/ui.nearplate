"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { XIcon } from "lucide-react"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

/** Module-level so any client code can push a toast without a hook. */
export const toastManager = ToastPrimitive.createToastManager()

export const toastTheme = tv({
  base: "pointer-events-auto flex w-[--toast-width,100%] flex-col gap-1 border-2 border-inverted bg-default p-3 shadow-[4px_4px_0_var(--ui-border)] data-[ending-style]:opacity-0 data-[starting-style]:translate-y-1/2 data-[starting-style]:opacity-0 data-[swiping]:transition-none",
  variants: {
    type: {
      error: "border-error text-error",
      success: "border-success text-success",
      info: "border-inverted text-default",
    },
  },
  defaultVariants: { type: "info" },
})

/** Mount once, near the root layout. Renders any toast pushed via `toastManager`. */
export function Toaster() {
  return (
    <ToastPrimitive.Provider toastManager={toastManager}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed inset-x-4 bottom-24 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-80 lg:bottom-4">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()
  return toasts.map((toast) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      className={cn(
        toastTheme({
          type: toast.type as VariantProps<typeof toastTheme>["type"],
        })
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          {toast.title ? (
            <ToastPrimitive.Title className="font-mono text-xs font-medium uppercase" />
          ) : null}
          {toast.description ? (
            <ToastPrimitive.Description className="text-xs text-muted" />
          ) : null}
        </div>
        <ToastPrimitive.Close
          aria-label="Dismiss"
          className="shrink-0 cursor-pointer p-1 hover:bg-elevated"
        >
          <XIcon aria-hidden className="size-3.5" />
        </ToastPrimitive.Close>
      </div>
    </ToastPrimitive.Root>
  ))
}
