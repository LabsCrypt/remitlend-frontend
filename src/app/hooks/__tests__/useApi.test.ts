// Test for useApi hook
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

test('fetches data successfully', async () => {
  // Mock fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'ok' }) } as any)
  ) as any;

  const { result } = renderHook(() => useApi('/test'), { wrapper });
  await waitFor(() => result.current.isSuccess);
  expect(result.current.data).toEqual({ message: 'ok' });
  expect(fetch).toHaveBeenCalledWith('http://localhost:3001/test', expect.any(Object));
});
