import "server-only"

import { apiRequest } from "@/lib/api/client"

import {
  addressSchema,
  type AccountAddress,
  type AddressFormInput,
} from "../schemas"

/** GET /users/me/addresses, default first. */
export async function listAddresses(
  accessToken: string
): Promise<AccountAddress[]> {
  const items = (await apiRequest("/users/me/addresses", {
    token: accessToken,
  })) as unknown[]
  return items.map((item) => addressSchema.parse(item))
}

/** POST /users/me/addresses */
export async function createAddress(
  accessToken: string,
  input: AddressFormInput
): Promise<AccountAddress> {
  return addressSchema.parse(
    await apiRequest("/users/me/addresses", {
      method: "POST",
      body: input,
      token: accessToken,
    })
  )
}

/** PATCH /users/me/addresses/:id */
export async function updateAddress(
  accessToken: string,
  id: string,
  patch: Partial<AddressFormInput>
): Promise<AccountAddress> {
  return addressSchema.parse(
    await apiRequest(`/users/me/addresses/${id}`, {
      method: "PATCH",
      body: patch,
      token: accessToken,
    })
  )
}

/** DELETE /users/me/addresses/:id */
export async function deleteAddress(
  accessToken: string,
  id: string
): Promise<void> {
  await apiRequest(`/users/me/addresses/${id}`, {
    method: "DELETE",
    token: accessToken,
  })
}
