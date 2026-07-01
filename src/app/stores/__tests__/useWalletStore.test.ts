// src/app/stores/__tests__/useWalletStore.test.ts
import { useWalletStore } from "../useWalletStore";

describe("useWalletStore", () => {
  beforeEach(() => {
    // Reset store to initial state
    useWalletStore.getState().disconnect();
  });

  it("initial state is disconnected", () => {
    const state = useWalletStore.getState();
    expect(state.status).toBe("disconnected");
    expect(state.address).toBeNull();
    expect(state.network).toBeNull();
    expect(state.balances).toEqual([]);
    expect(state.isLoadingBalances).toBe(false);
    expect(state.error).toBeNull();
    expect(state.errorKind).toBeNull();
  });

  it("setConnected updates state correctly", () => {
    const network = { chainId: 1, name: "Testnet", isSupported: true };
    useWalletStore.getState().setConnected("0xABC", network);
    const state = useWalletStore.getState();
    expect(state.status).toBe("connected");
    expect(state.address).toBe("0xABC");
    expect(state.network).toBe(network);
    expect(state.shouldAutoReconnect).toBe(true);
    expect(state.error).toBeNull();
  });

  it("disconnect resets to initial state", () => {
    const network = { chainId: 1, name: "Testnet", isSupported: true };
    useWalletStore.getState().setConnected("0xABC", network);
    // Disconnect
    useWalletStore.getState().disconnect();
    const state = useWalletStore.getState();
    expect(state).toMatchObject({
      status: "disconnected",
      address: null,
      network: null,
      balances: [],
      isLoadingBalances: false,
      error: null,
      errorKind: null,
      networkMismatch: false,
      shouldAutoReconnect: false,
    });
  });

  it("setError records error and status", () => {
    useWalletStore.getState().setError("Something went wrong", "error", "generic");
    const state = useWalletStore.getState();
    expect(state.error).toBe("Something went wrong");
    expect(state.status).toBe("error");
    expect(state.errorKind).toBe("generic");
    expect(state.isLoadingBalances).toBe(false);
  });

  it("setNetworkMismatch updates flag", () => {
    useWalletStore.getState().setNetworkMismatch(true);
    expect(useWalletStore.getState().networkMismatch).toBe(true);
    useWalletStore.getState().setNetworkMismatch(false);
    expect(useWalletStore.getState().networkMismatch).toBe(false);
  });
});
