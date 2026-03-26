import type { UploadResponse } from "@finboard/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function uploadCsv(
  file: File,
  signal?: AbortSignal
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody &&
      typeof errorBody === "object" &&
      "error" in errorBody &&
      typeof (errorBody as Record<string, unknown>).error === "object"
        ? ((errorBody as { error: { message: string } }).error.message)
        : `Upload failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<UploadResponse>;
}
