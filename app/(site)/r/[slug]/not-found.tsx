import Link from "next/link"

import { buttonTheme } from "@/components/ui/button"

export default function RestaurantNotFound() {
  return (
    <div className="flex flex-col items-start gap-3 p-4 py-16">
      <h1 className="font-display text-6xl leading-none uppercase">
        Kitchen not found
      </h1>
      <p className="max-w-md text-sm text-toned">
        This restaurant doesn&apos;t exist, or its link has changed.
      </p>
      <Link href="/#restaurants" className={buttonTheme({ size: "sm" })}>
        Browse restaurants
      </Link>
    </div>
  )
}
