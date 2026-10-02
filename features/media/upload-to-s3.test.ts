import { describe, expect, test, vi } from "vitest"

import {
  buildPresignedForm,
  postToS3,
  postToS3WithProgress,
} from "./upload-to-s3"

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

class FakeXhr {
  static last: FakeXhr
  status = 0
  upload: { onprogress: ((event: ProgressEvent) => void) | null } = {
    onprogress: null,
  }
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  open = vi.fn()
  send = vi.fn()
  constructor() {
    FakeXhr.last = this
  }
}

describe("postToS3WithProgress", () => {
  test("reports progress as a percentage and resolves true on 2xx", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXhr)
    const onProgress = vi.fn()
    const form = new FormData()

    const result = postToS3WithProgress("https://s3.test", form, onProgress)
    FakeXhr.last.upload.onprogress?.({
      lengthComputable: true,
      loaded: 25,
      total: 100,
    } as ProgressEvent)
    FakeXhr.last.status = 204
    FakeXhr.last.onload?.()

    expect(await result).toBe(true)
    expect(onProgress).toHaveBeenCalledWith(25)
    expect(FakeXhr.last.open).toHaveBeenCalledWith("POST", "https://s3.test")
    expect(FakeXhr.last.send).toHaveBeenCalledWith(form)
  })

  test("resolves false on a non-2xx response", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXhr)

    const result = postToS3WithProgress(
      "https://s3.test",
      new FormData(),
      vi.fn()
    )
    FakeXhr.last.status = 403
    FakeXhr.last.onload?.()

    expect(await result).toBe(false)
  })

  test("resolves false on a network error", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXhr)

    const result = postToS3WithProgress(
      "https://s3.test",
      new FormData(),
      vi.fn()
    )
    FakeXhr.last.onerror?.()

    expect(await result).toBe(false)
  })
})
