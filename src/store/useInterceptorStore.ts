import { create } from 'zustand';

export interface RequestConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
}

export type ReqFn = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResSuccessFn = (response: Response) => Response | Promise<Response>;
export type ResErrorFn = (error: unknown) => Response | Promise<Response>;

interface InterceptorEntry {
  onFulfilled: ResSuccessFn;
  onRejected?: ResErrorFn;
}

interface InterceptorState {
  reqFns: { onFulfilled: ReqFn }[];
  resFns: InterceptorEntry[];
  addRequestInterceptor: (onFulfilled: ReqFn) => void;
  addResponseInterceptor: (onFulfilled: ResSuccessFn, onRejected?: ResErrorFn) => void;
}

const useInterceptorStore = create<InterceptorState>((set) => ({
  reqFns: [],
  resFns: [],
  addRequestInterceptor: (onFulfilled) =>
    set((state) => ({ reqFns: [...state.reqFns, { onFulfilled }] })),
  addResponseInterceptor: (onFulfilled, onRejected) =>
    set((state) => ({ resFns: [...state.resFns, { onFulfilled, onRejected }] })),
}));

export { useInterceptorStore };
