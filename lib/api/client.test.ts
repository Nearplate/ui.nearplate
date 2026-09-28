import { afterEach, describe, expect, it, vi } from "vitest"

import { apiRedirectLocation, ApiError, apiRequest } from "./client"

function stubFetch(response: Response | Error) {
  const fetchMock = vi.fn(async () => {
    if (response instanceof Error) throw response
    return response
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

describe("apiRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns parsed JSON for a 2xx response", async () => {
    stubFetch(Response.json({ status: "sent" }))

    const result = await apiRequest("/auth/magic-link", { method: "POST" })

    expect(result).toEqual({ status: "sent" })
  })

  it("returns undefined for 204", async () => {
    stubFetch(new Response(null, { status: 204 }))

    expect(await apiRequest("/auth/logout", { method: "POST" })).toBeUndefined()
  })

  it("throws ApiError carrying the status for non-2xx", async () => {
    stubFetch(Response.json({ statusCode: 429 }, { status: 429 }))

    await expect(apiRequest("/auth/magic-link")).rejects.toMatchObject({
      name: "ApiError",
      status: 429,
    })
  })

  it("maps network failures to a 503 ApiError", async () => {
    stubFetch(new TypeError("fetch failed"))

    const error = await apiRequest("/users/me").catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 503 })
  })

  it("sends JSON body and bearer token", async () => {
    const fetchMock = stubFetch(Response.json({}))

    await apiRequest("/users/me", {
      method: "PATCH",
      body: { firstName: "Asha" },
      token: "abc",
    })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toBe("http://localhost:8080/v1/users/me")
    expect(init.method).toBe("PATCH")
    expect(init.body).toBe(JSON.stringify({ firstName: "Asha" }))
    expect(init.headers).toMatchObject({
      Authorization: "Bearer abc",
      "Content-Type": "application/json",
    })
  })

  it("sends the device id header when given", async () => {
    const fetchMock = stubFetch(Response.json({}))

    await apiRequest("/auth/refresh", { method: "POST", deviceId: "d1" })

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(init.headers).toMatchObject({ "X-Device-Id": "d1" })
  })

  it("omits the device id header when not given", async () => {
    const fetchMock = stubFetch(Response.json({}))

    await apiRequest("/auth/refresh", { method: "POST" })

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(init.headers).not.toHaveProperty("X-Device-Id")
  })
})

describe("apiRedirectLocation", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns the Location header for a 3xx response", async () => {
    stubFetch(
      new Response(null, {
        status: 302,
        headers: { Location: "https://accounts.google.com/auth" },
      })
    )

    const location = await apiRedirectLocation("/auth/google")

    expect(location).toBe("https://accounts.google.com/auth")
  })

  it("throws ApiError when the response is not a redirect", async () => {
    stubFetch(Response.json({ statusCode: 400 }, { status: 400 }))

    await expect(apiRedirectLocation("/auth/google")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
    })
  })

  it("throws ApiError when a redirect has no Location header", async () => {
    stubFetch(new Response(null, { status: 302 }))

    await expect(apiRedirectLocation("/auth/google")).rejects.toMatchObject({
      name: "ApiError",
      status: 302,
    })
  })

  it("maps network failures to a 503 ApiError", async () => {
    stubFetch(new TypeError("fetch failed"))

    const error = await apiRedirectLocation("/auth/google").catch(
      (e: unknown) => e
    )

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 503 })
  })
})
