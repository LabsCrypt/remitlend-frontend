import { renderHook, act } from " @testing-library/react-hooks\;
import { QueryClient, QueryClientProvider } from \@tanstack/react-query\;
import { useTransactionPreview } from \../useTransactionPreview\;

type TransactionPreviewData = {
 operations: any[];
 balanceChanges: any[];
 estimatedGasFee: string;
 network: string;
};

function wrapper({ children }: { children: React.ReactNode }) {
 const client = new QueryClient({
 defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
 });
 return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe(\useTransactionPreview hook\, () => {
 it(\opens modal and confirms callback\, async () => {
 const onConfirm = jest.fn().mockResolvedValue(undefined);
 const { result } = renderHook(() => useTransactionPreview(), { wrapper });
 const dummyData: TransactionPreviewData = {
 operations: [],
 balanceChanges: [],
 estimatedGasFee: \0\,
 network: \Testnet\,
 } as any;
 act(() => {
 result.current.show(dummyData, onConfirm);
 });
 expect(result.current.isOpen).toBe(true);
 expect(result.current.data).toBe(dummyData);
 await act(async () => {
 await result.current.confirm();
 });
 expect(onConfirm).toHaveBeenCalled();
 expect(result.current.isOpen).toBe(false);
 });
});
