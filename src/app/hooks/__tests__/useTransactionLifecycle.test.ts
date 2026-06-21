import { renderHook, act } from "@testing-library/react";
import { useTransactionLifecycle } from "../useTransactionLifecycle";

describe("useTransactionLifecycle", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useTransactionLifecycle());
    expect(result.current.lifecycle.state).toBe("idle");
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.isProcessing).toBe(false);
  });

  it("transitions through full success flow", () => {
    const { result } = renderHook(() => useTransactionLifecycle());

    act(() => {
      result.current.transition({
        type: "START_BUILD",
        context: { operation: "test" },
      });
    });
    expect(result.current.lifecycle.state).toBe("building");

    act(() => result.current.transition({ type: "BUILD_SUCCESS" }));
    expect(result.current.lifecycle.state).toBe("awaiting-signature");

    act(() => result.current.transition({ type: "SIGNATURE_SUCCESS" }));
    expect(result.current.lifecycle.state).toBe("submitting");

    act(() =>
      result.current.transition({ type: "SUBMIT_SUCCESS", txHash: "abc123" }),
    );
    expect(result.current.lifecycle.state).toBe("confirming");
    expect(result.current.lifecycle.txHash).toBe("abc123");

    act(() => result.current.transition({ type: "CONFIRM_SUCCESS" }));
    expect(result.current.lifecycle.state).toBe("success");
    expect(result.current.isSuccess).toBe(true);
  });

  it("prevents double-submit via idempotency lock", () => {
    const { result } = renderHook(() => useTransactionLifecycle());

    act(() => {
      result.current.transition({
        type: "START_BUILD",
        context: { operation: "test" },
      });
    });
    act(() => result.current.transition({ type: "BUILD_SUCCESS" }));
    act(() => result.current.transition({ type: "SIGNATURE_SUCCESS" }));
    act(() => result.current.transition({ type: "SUBMIT" }));

    act(() => result.current.transition({ type: "SUBMIT" }));
    expect(result.current.lifecycle.state).toBe("submitting");
  });

  it("handles errors and allows retry", () => {
    const { result } = renderHook(() => useTransactionLifecycle());

    act(() => {
      result.current.transition({
        type: "START_BUILD",
        context: { operation: "test" },
      });
    });
    act(() =>
      result.current.transition({
        type: "ERROR",
        error: new Error("User declined"),
      }),
    );

    expect(result.current.lifecycle.state).toBe("error");
    expect(result.current.lifecycle.error?.category).toBe("wallet_rejected");
    expect(result.current.lifecycle.error?.retryable).toBe(true);

    act(() => result.current.transition({ type: "RETRY" }));
    expect(result.current.lifecycle.state).toBe("building");
    expect(result.current.lifecycle.error).toBeNull();
  });

  it("maps network errors correctly", () => {
    const { result } = renderHook(() => useTransactionLifecycle());

    act(() => {
      result.current.transition({
        type: "START_BUILD",
        context: { operation: "test" },
      });
    });
    act(() =>
      result.current.transition({
        type: "ERROR",
        error: new Error("timeout"),
      }),
    );

    expect(result.current.lifecycle.error?.category).toBe("network_timeout");
    expect(result.current.lifecycle.error?.retryable).toBe(true);
  });

  it("maps on-chain failures as non-retryable", () => {
    const { result } = renderHook(() => useTransactionLifecycle());

    act(() => {
      result.current.transition({
        type: "START_BUILD",
        context: { operation: "test" },
      });
    });
    act(() =>
      result.current.transition({
        type: "ERROR",
        error: new Error("tx failed on-chain"),
      }),
    );

    expect(result.current.lifecycle.error?.category).toBe("onchain_failure");
    expect(result.current.lifecycle.error?.retryable).toBe(false);
  });

  it("resets to idle", () => {
    const { result } = renderHook(() => useTransactionLifecycle());

    act(() => {
      result.current.transition({
        type: "START_BUILD",
        context: { operation: "test" },
      });
    });
    act(() => result.current.transition({ type: "RESET" }));

    expect(result.current.lifecycle.state).toBe("idle");
    expect(result.current.canSubmit).toBe(true);
  });
});