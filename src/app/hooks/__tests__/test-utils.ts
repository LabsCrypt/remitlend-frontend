// test-utils.ts
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, RenderHookResult } from "@testing-library/react-hooks";

/**
 * Render a hook within a QueryClientProvider for testing.
 * Returns the render result and the client for further manipulation.
 */
export function renderHookWithClient<TProps, TResult>(
  hook: (props: TProps) => TResult,
  { initialProps }: { initialProps?: TProps } = {}
): { result: RenderHookResult<TProps, TResult>; client: QueryClient } {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, cacheTime: Infinity },
      mutations: { retry: false },
    },
  });

  const wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  const result = renderHook<TProps, TResult>(hook, { wrapper, initialProps });
  return { result, client };
}
