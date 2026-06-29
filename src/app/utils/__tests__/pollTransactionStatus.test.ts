import { pollTransactionStatus } from "../transactionErrors";

// Mock fetch for tests
global.fetch = jest.fn();

describe("pollTransactionStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns success when transaction is confirmed", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ successful: true }),
    });

    const result = await pollTransactionStatus("txhash123", {
      horizonUrl: "https://horizon-testnet.stellar.org",
      intervalMs: 100,
      timeoutMs: 5000,
    });

    expect(result.status).toBe("success");
    expect(result.message).toBe("Transaction confirmed on-chain.");
  });

  it("returns failed when transaction fails on-chain", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ successful: false }),
    });

    const result = await pollTransactionStatus("txhash123", {
      horizonUrl: "https://horizon-testnet.stellar.org",
      intervalMs: 100,
      timeoutMs: 5000,
    });

    expect(result.status).toBe("failed");
    expect(result.message).toBe("Transaction failed on-chain.");
  });

  it("returns timeout when transaction stays pending", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 404,
      ok: false,
    });

    const result = await pollTransactionStatus("txhash123", {
      horizonUrl: "https://horizon-testnet.stellar.org",
      intervalMs: 100,
      timeoutMs: 300,
    });

    expect(result.status).toBe("timeout");
    expect(result.message).toBe("Transaction is still pending. You can retry status tracking.");
  });

  it("returns cancelled when abort signal is triggered", async () => {
    jest.useFakeTimers();

    (fetch as jest.Mock).mockResolvedValue({
      status: 404,
      ok: false,
    });

    const controller = new AbortController();

    const pollPromise = pollTransactionStatus("txhash123", {
      horizonUrl: "https://horizon-testnet.stellar.org",
      intervalMs: 100,
      timeoutMs: 5000,
      signal: controller.signal,
    });

    // Abort after a short delay
    controller.abort();

    // Advance timers so the polling sleep resolves and the abort check runs
    await jest.advanceTimersByTimeAsync(100);

    const result = await pollPromise;

    expect(result.status).toBe("cancelled");
    expect(result.message).toBe("Status tracking cancelled by user.");
  });

  it("polls multiple times before success", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        status: 404,
        ok: false,
      })
      .mockResolvedValueOnce({
        status: 404,
        ok: false,
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ successful: true }),
      });

    const result = await pollTransactionStatus("txhash123", {
      horizonUrl: "https://horizon-testnet.stellar.org",
      intervalMs: 100,
      timeoutMs: 5000,
    });

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(result.status).toBe("success");
  });
});
