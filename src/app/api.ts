const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

export function resolveApiUrl(input: RequestInfo): RequestInfo {
  if (typeof input !== 'string' || isAbsoluteUrl(input) || !input.startsWith('/api')) {
    return input;
  }

  if (typeof window === 'undefined') {
    return input;
  }

  const { protocol, hostname, port } = window.location;
  const isBackendOrigin = port === '3001';
  const isViteDevServer = /^517\d$/.test(port);
  const isPreviewServer = /^417\d$/.test(port);
  const shouldUseDirectBackend = isViteDevServer || isPreviewServer;

  if (isBackendOrigin) {
    return `${protocol}//${hostname}:3001${input}`;
  }

  if (shouldUseDirectBackend) {
    return `${protocol}//${hostname}:3001${input}`;
  }

  return input;
}

export async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(resolveApiUrl(input), {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;

    try {
      const data = await response.clone().json() as { message?: string };
      if (data?.message) {
        message = `${data.message} (${response.status})`;
      }
    } catch {
      try {
        const text = await response.text();
        if (text) {
          message = `${text} (${response.status})`;
        }
      } catch {
        // Keep the default message when the response body cannot be read.
      }
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function sendJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  return readJson<T>(input, init);
}

export async function sendNoContent(input: RequestInfo, init?: RequestInit): Promise<void> {
  const response = await fetch(resolveApiUrl(input), {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
}
