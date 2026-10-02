/** Presigned-POST body: every signed field first, the file last (S3 requires it). */
export function buildPresignedForm(
  fields: Record<string, string>,
  file: File
): FormData {
  const form = new FormData()
  for (const [name, value] of Object.entries(fields)) form.append(name, value)
  form.append("file", file)
  return form
}

/** POSTs the form straight to S3 from the browser. False on any failure. */
export async function postToS3(url: string, form: FormData): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "POST", body: form })
    return response.ok
  } catch {
    return false
  }
}
