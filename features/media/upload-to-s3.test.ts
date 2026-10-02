import { describe, expect, test, vi } from "vitest"

import { buildPresignedForm, postToS3 } from "./upload-to-s3"

describe("buildPresignedForm", () => {
  test("appends presigned fields in order and the file last", () => {
    const file = new File(["x"], "a.png", { type: "image/png" })

    const form = buildPresignedForm({ key: "k", policy: "p" }, file)

    expect([...form.keys()]).toEqual(["key", "policy", "file"])
    expect(form.get("file")).toBeInstanceOf(File)
  })
})

describe("postToS3", () => {
  test("returns true on a 2xx response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }))
    expect(await postToS3("https://s3.test", new FormData())).toBe(true)
  })

  test("returns false on a non-2xx response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))
    expect(await postToS3("https://s3.test", new FormData())).toBe(false)
  })

  test("returns false when the network fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))
    expect(await postToS3("https://s3.test", new FormData())).toBe(false)
  })
})
