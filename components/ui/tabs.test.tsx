import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"

function ExampleTabs() {
  return (
    <Tabs defaultValue="orders">
      <TabsList>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="addresses">Address book</TabsTrigger>
      </TabsList>
      <TabsContent value="orders">Orders panel</TabsContent>
      <TabsContent value="addresses">Address book panel</TabsContent>
    </Tabs>
  )
}

describe("Tabs", () => {
  it("shows the default tab's panel and hides the other", () => {
    render(<ExampleTabs />)

    expect(screen.getByText("Orders panel")).toBeVisible()
    expect(screen.queryByText("Address book panel")).not.toBeInTheDocument()
  })

  it("switches panels when a tab is clicked", async () => {
    const user = userEvent.setup()
    render(<ExampleTabs />)

    await user.click(screen.getByRole("tab", { name: "Address book" }))

    expect(screen.getByText("Address book panel")).toBeVisible()
    expect(screen.queryByText("Orders panel")).not.toBeInTheDocument()
  })

  it("switches panels with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<ExampleTabs />)

    screen.getByRole("tab", { name: "Orders" }).focus()
    await user.keyboard("{ArrowRight}")

    expect(screen.getByRole("tab", { name: "Address book" })).toHaveFocus()
    expect(await screen.findByText("Address book panel")).toBeVisible()
  })
})
