import redaxios from 'redaxios';
import * as Sentry from '@sentry/react';
import { useAuthStore } from '../store/useAuthStore';
import { useInterceptorStore } from '../store/useInterceptorStore';
import type { RequestConfig, ReqFn, ResSuccessFn, ResErrorFn } from '../store/useInterceptorStore';

const apiHost = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL;
const normalizedHost = apiHost ? String(apiHost).replace(/\/+$/g, '') : '';
const baseURL = normalizedHost ? `${normalizedHost}/api` : '/api';

const GENERIC_ERROR_MESSAGE = 'Something went wrong, Please try after sometime';

interface HttpError extends Error {
  response?: Response;
  status?: number;
  data?: unknown;
  config?: { method?: string; url?: string };
}

interface InterceptorApi {
  interceptors: {
    request: { use: (fn: ReqFn) => void };
    response: { use: (fn: ResSuccessFn, errFn?: ResErrorFn) => void };
  };
}

type ApiClient = ReturnType<typeof redaxios.create> & InterceptorApi;

function getInterceptorState() {
  return useInterceptorStore.getState();
}

// ── Custom fetch with interceptor chain ────────────────────────────────────

async function customFetch(input: URL | RequestInfo, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const opts = init ?? {};

  let config: RequestConfig = {
    url,
    method: (opts.method as string) || 'GET',
    headers: Object.fromEntries(new Headers(opts.headers).entries()),
    body: opts.body as unknown,
    credentials: opts.credentials,
  };

  // ── Request interceptor chain ────────────────────────────────────────────
  const { reqFns } = getInterceptorState();
  for (const { onFulfilled } of reqFns) {
    config = await onFulfilled(config);
  }

  // ── Make the fetch call with timeout ─────────────────────────────────────
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  let response: Response;
  try {
    response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body as BodyInit | null | undefined,
      credentials: config.credentials,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    const error = err as HttpError;
    const isNetworkOrTimeout =
      error.name === 'AbortError' ||
      error.message === 'Network Error' ||
      (typeof error.message === 'string' &&
        (error.message.toLowerCase().includes('timeout') ||
          error.message.toLowerCase().includes('network')));

    if (isNetworkOrTimeout) {
      error.message = GENERIC_ERROR_MESSAGE;
    }

    if (isNetworkOrTimeout || !error.response) {
      Sentry.captureException(error, {
        tags: { kind: 'api', status: 'network' as const },
        extra: { method: config.method, url: config.url },
      });
    }

    // Run error interceptors (like axios interceptor.onRejected chain)
    let e: unknown = error;
    for (const { onRejected } of getInterceptorState().resFns) {
      if (onRejected) {
        try {
          return await onRejected(e);
        } catch (nextErr) {
          e = nextErr;
        }
      }
    }
    throw e;
  }
  clearTimeout(timeoutId);

  // ── 401 → logout (legacy token mode) ────────────────────────────────────
  if (response.status === 401) {
    useAuthStore.getState().logout();
  }

  // ── Non-2xx → throw so error interceptors can handle ────────────────────
  if (!response.ok) {
    const httpError = new Error(`Request failed with status ${response.status}`) as HttpError;
    httpError.response = response;
    httpError.status = response.status;

    try {
      httpError.data = await response.clone().json();
    } catch {
      try {
        httpError.data = await response.clone().text();
      } catch {
        httpError.data = null;
      }
    }

    // Sentry: report 5xx
    if (response.status >= 500) {
      Sentry.captureException(httpError, {
        tags: { kind: 'api', status: response.status },
        extra: { method: config.method, url: config.url },
      });
    }

    // Run error interceptors
    let e: unknown = httpError;
    for (const { onRejected } of getInterceptorState().resFns) {
      if (onRejected) {
        try {
          return await onRejected(e);
        } catch (nextErr) {
          e = nextErr;
        }
      }
    }
    throw e;
  }

  // ── Response success interceptor chain ───────────────────────────────────
  for (const { onFulfilled } of getInterceptorState().resFns) {
    try {
      response = await onFulfilled(response);
    } catch (err: unknown) {
      let e: unknown = err;
      for (const { onRejected } of getInterceptorState().resFns) {
        if (onRejected) {
          try {
            return await onRejected(e);
          } catch (nextErr) {
            e = nextErr;
          }
        }
      }
      throw e;
    }
  }

  return response;
}

// ── Create the redaxios client ────────────────────────────────────────────

const baseClient = redaxios.create({
  baseURL,
  fetch: customFetch,
});

// ── Build the extended api client with interceptors ────────────────────────

const apiClient = baseClient as ApiClient;

apiClient.interceptors = {
  request: {
    use(onFulfilled: ReqFn) {
      useInterceptorStore.getState().addRequestInterceptor(onFulfilled);
    },
  },
  response: {
    use(onFulfilled: ResSuccessFn, onRejected?: ResErrorFn) {
      useInterceptorStore.getState().addResponseInterceptor(onFulfilled, onRejected);
    },
  },
};

// ── Default request interceptor: attach Bearer token ───────────────────────

apiClient.interceptors.request.use((config: RequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Support apiClient.delete(url, { data }) ────────────────────────────────
// Redaxios does not pass a body in DELETE, so extract `data` from config and
// call the client with method: 'delete' and the data as the request body.

const origDelete = apiClient.delete.bind(apiClient);
apiClient.delete = (url: string, config?: Record<string, unknown>) => {
  const { data, ...rest } = config ?? {};
  if (data !== undefined) {
    return apiClient(url, {
      ...rest,
      method: 'delete' as const,
      data,
    });
  }
  return origDelete(url, config);
};

export { apiClient };
