import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { DefaultAvatar, pickColorForName } from "./default-image"

describe("pickColorForName", () => {
  test("is stable for the same name", () => {
    expect(pickColorForName("Spice Hub")).toEqual(pickColorForName("Spice Hub"))
  })

  test("ignores case and surrounding whitespace", () => {
    expect(pickColorForName("  spice hub ")).toEqual(
      pickColorForName("SPICE HUB")
    )
  })

  test("spreads different names across more than one colour", () => {
    const names = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot"]
    expect(
      new Set(names.map((name) => pickColorForName(name).cssVar)).size
    ).toBeGreaterThan(1)
  })
})

describe("DefaultAvatar", () => {
  test("shows the uppercase first letter of the name", () => {
    render(<DefaultAvatar name="spice hub" />)
    expect(screen.getByText("S")).toBeInTheDocument()
  })
})
