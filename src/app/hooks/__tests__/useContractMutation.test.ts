import { renderHook, act } from " @testing-library/react-hooks\;
import { QueryClient, QueryClientProvider } from \@tanstack/react-query\;
import { useContractMutation } from \../useContractMutation\;

// Mock toast and gamification store
jest.mock(\../useContractToast\, () => ({
 useContractToast: () => ({
 showPending: jest.fn().mockReturnValue(\toast-id\),
 showSuccess: jest.fn(),
 showError: jest.fn(),
 }),
}));

jest.mock(\../../stores/useGamificationStore\, () => ({
 useGamificationStore: () => ({
 addXP: jest.fn(),
 unlockAchievement: jest.fn(),
 }),
}));

type MockMutationResult<TData, TError, TVariables> = {
 mutate: jest.Mock,
 mutateAsync: jest.Mock,
 isLoading: boolean,
 isError: boolean,
 isSuccess: boolean,
};

const createMockMutation = <TData, TError, TVariables>(
 onSuccess?: (data: TData, variables: TVariables) => void,
 onError?: (error: TError, variables: TVariables) => void,
): MockMutationResult<TData, TError, TVariables> => {
 return {
 mutate: jest.fn((variables: TVariables, opts: any) => {
 if (onSuccess) {
 const data = { txHash: \mock-hash\ } as unknown as TData;
 opts?.onSuccess?.(data, variables);
 onSuccess(data, variables);
 } else if (onError) {
 const err = new Error(\mock error\) as unknown as TError;
 opts?.onError?.(err, variables);
 onError(err, variables);
 }
 }),
 mutateAsync: jest.fn(async (variables: TVariables) => {
 if (onSuccess) {
 const data = { txHash: \mock-hash\ } as unknown as TData;
 onSuccess(data, variables);
 return data;
 }
 throw new Error(\mock error\);
 }),
 isLoading: false,
 isError: false,
 isSuccess: false,
 } as any;
};

const queryClient = new QueryClient();
function wrapper({ children }: { children: React.ReactNode }) {
 return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe(\useContractMutation\, () => {
 it(\calls toast and gamification on successful mutate\, () => {
 const mockMutation = createMockMutation<{ txHash: string }, Error, { amount: number }>(
 () => {}
 );
 const { result } = renderHook(
 () => useContractMutation(mockMutation as any, { pendingMessage: \Pending\, successMessage: \Success\, gamificationXP: 10 }),
 { wrapper },
 );
 act(() => {
 result.current.mutate({ amount: 100 });
 });
 const { useContractToast } = require(\../useContractToast\);
 const toast = useContractToast();
 expect(toast.showPending).toHaveBeenCalledWith(\Pending\);
 expect(toast.showSuccess).toHaveBeenCalledWith(\toast-id\, expect.objectContaining({ successMessage: \Success\, txHash: \mock-hash\, network: \testnet\ }));
 const { useGamificationStore } = require(\../../stores/useGamificationStore\);
 const gamify = useGamificationStore();
 expect(gamify.addXP).toHaveBeenCalledWith(10, undefined);
 });

 it(\shows error toast on failed mutateAsync\, async () => {
 const mockMutation = createMockMutation<{ txHash: string }, Error, { amount: number }>(
 undefined,
 () => {}
 );
 const { result } = renderHook(
 () => useContractMutation(mockMutation as any, { errorMessage: \Oops\ }),
 { wrapper },
 );
 await act(async () => {
 await expect(result.current.mutateAsync({ amount: 50 })).rejects.toThrow();
 });
 const { useContractToast } = require(\../useContractToast\);
 const toast = useContractToast();
 expect(toast.showPending).toHaveBeenCalled();
 expect(toast.showError).toHaveBeenCalledWith(\toast-id\, expect.objectContaining({ errorMessage: \Oops\ }));
 });
});
