// src/app/hooks/__tests__/useRepaymentOperation.test.ts
import { renderHook, act } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRepaymentOperation } from "../useRepaymentOperation";

// Mock the transaction hook
jest.mock("../useOptimisticUI", () => ({
  useTransaction: jest.fn(() => ({
    start: jest.fn(),
    updateProgress: jest.fn(),
    sign: jest.fn(),
    submit: jest.fn(),
    confirm: jest.fn(),
    complete: jest.fn(),
    fail: jest.fn(),
    isOpen: false,
    isLoading: false,
    isSigning: false,
    isSubmitted: false,
    isConfirming: false,
    isSuccess: false,
    isError: false,
    data: undefined,
  })),
}));

// Mock react-query's QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

describe("useRepaymentOperation", () => {
  it("executes repayment successfully", async () => {
    const { result } = renderHook(() => useRepaymentOperation(), { wrapper });
    const repayment = result.current;
    const promise = repayment.executeRepayment({
      loanId: 1,
      amount: 100,
      borrowerAddress: "GABC123",
    });
    await act(async () => {
      await promise;
    });
    // Verify transaction flow calls
    expect(repayment.start).toHaveBeenCalled();
    expect(repayment.updateProgress).toHaveBeenCalledWith(20, "Building transaction...");
    expect(repayment.sign).toHaveBeenCalled();
    expect(repayment.submit).toHaveBeenCalled();
    expect(repayment.confirm).toHaveBeenCalled();
    expect(repayment.complete).toHaveBeenCalled();
    expect(repayment.error).toBeNull();
  });

  it("handles repayment error", async () => {
    // Mock transaction.fail to set error state
    const { useTransaction } = require("../useOptimisticUI");
    const failMock = jest.fn();
    useTransaction.mockReturnValue({
      start: jest.fn(),
      updateProgress: jest.fn(),
      sign: jest.fn(),
      submit: jest.fn(),
      confirm: jest.fn(),
      complete: jest.fn(),
      fail: failMock,
      isOpen: false,
      isLoading: false,
      isSigning: false,
      isSubmitted: false,
      isConfirming: false,
      isSuccess: false,
      isError: false,
      data: undefined,
    });

    const { result } = renderHook(() => useRepaymentOperation(), { wrapper });
    const repayment = result.current;
    // Force error by making setTimeout reject
    jest.spyOn(global, "setTimeout").mockImplementationOnce((_cb, _ms) => {
      throw new Error("Simulated failure");
    });
    await expect(
      act(async () => {
        await repayment.executeRepayment({ loanId: 1, amount: 100, borrowerAddress: "GXYZ" });
      })
    ).rejects.toThrow();
    expect(failMock).toHaveBeenCalled();
    expect(repayment.error).not.toBeNull();
  });
});
