import { pollTransactionStatus } from "../transactionErrors";

// Mock fetch globally
global.fetch = jest.fn();

describe("pollTransactionStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns success when transaction is confirmed", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        status: 404,
      })
      .mockResolvedValueOnce({
        status: 404,
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ successful: true }),
      });

    const promise = pollTransactionStatus("tx123", {
      horizonUrl: "https://horizon-testnet.stellar.org",
      intervalMs: 100,
      timeoutMs: 1000,
    });

    // Advance past two polling intervals
    await jest.advanceTimersByTimeAsync(200);

    const result = await promise;
    expect(result.status).toBe("success");
    expect(result.message).toBe("Transaction confirmed on-chain.");
  });

  it("returns failed when transaction fails on-chain", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ successful: false }),
    });

    const result = await pollTransactionStatus("tx456", {
      horizonUrl: "https://horizon-testnet.stellar.org",
      intervalMs: 100,
      timeoutMs: 1000,
    });

    expect(result.status).toBe("failed");
    expect(result.message).toBe("Transaction failed on-chain.");
  });

  it("returns timeout when confirmation takes too long", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 404,
    });

    const promise = pollTransactionStatus("tx789", {
      horizonUrl: "https://horizon-testnet.stellar.org",
      intervalMs: 100,
      timeoutMs: 500,
    });

    await jest.advanceTimersByTimeAsync(600);

    const result = await promise;
    expect(result.status).toBe("timeout");
    expect(result.message).toContain("still pending");
  });

  it("returns cancelled when abort signal is triggered", async () => {
    const controller = new AbortController();
    (fetch as jest.Mock).mockResolvedValue({
      status: 404,
    });

    const promise = pollTransactionStatus("tx000", {
      horizonUrl: "https://horizon-testnet.stellar.org",
      intervalMs: 100,
      timeoutMs: 1000,
      signal: controller.signal,
    });

    controller.abort();

    const result = await promise;
    expect(result.status).toBe("cancelled");
    expect(result.message).toBe("Status tracking cancelled by user.");
  });
});