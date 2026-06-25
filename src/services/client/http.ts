export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  parseJson?: boolean;
};

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, parseJson = true, headers, ...init } = options;

  const isFormData = body instanceof FormData;
  const res = await fetch(path, {
    ...init,
    headers: isFormData
      ? headers
      : {
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...headers,
        },
    body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),
  });

  if (!parseJson) {
    if (!res.ok) {
      throw new ApiClientError(`Error ${res.status}`, res.status);
    }
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : `Error ${res.status}`;
    throw new ApiClientError(message, res.status, data);
  }

  return data as T;
}

export async function apiBlob(path: string, init?: RequestInit): Promise<Blob> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      typeof data === "object" &&
      data &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : `Error ${res.status}`;
    throw new ApiClientError(message, res.status, data);
  }
  return res.blob();
}
