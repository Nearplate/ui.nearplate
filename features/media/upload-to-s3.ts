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

const HTTP_OK_MIN = 200
const HTTP_OK_MAX = 300
const PERCENT = 100

/**
 * Like `postToS3`, but reports upload progress (0-100). Uses XHR because
 * `fetch` can't observe upload progress. False on any failure.
 */
export function postToS3WithProgress(
  url: string,
  form: FormData,
  onProgress: (percent: number) => void
): Promise<boolean> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * PERCENT))
      }
    }
    xhr.onload = () =>
      resolve(xhr.status >= HTTP_OK_MIN && xhr.status < HTTP_OK_MAX)
    xhr.onerror = () => resolve(false)
    xhr.open("POST", url)
    xhr.send(form)
  })
}
