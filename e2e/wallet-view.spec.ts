import { test, expect, type Page } from "@playwright/test";

const MOCK_ADDRESS = "GCJPBXSE6WCQDCEYZW6C3YVZCSSCHC4AE72L5KWKCYL2CLLL7NH5VSCI";

test.describe("Wallet View", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Mock wallet connection state via localStorage
    const walletState = {
      state: {
        status: "connected",
        address: MOCK_ADDRESS,
        network: { chainId: 2, name: "TESTNET", isSupported: true },
        balances: [
          { symbol: "USDC", amount: "5000.00", usdValue: 5000 },
          { symbol: "XLM", amount: "100.00", usdValue: 12.5 },
        ],
        shouldAutoReconnect: true,
      },
      version: 0,
    };

    await page.addInitScript((state: any) => {
      window.localStorage.setItem("remitlend-wallet", JSON.stringify(state));
    }, walletState);

    // Mock wallet transaction history
    await page.route("**/api/wallet/history", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            { id: "tx_1", type: "deposit", amount: 500, asset: "USDC", status: "completed", date: new Date().toISOString() },
            { id: "tx_2", type: "withdrawal", amount: 100, asset: "USDC", status: "completed", date: new Date().toISOString() },
          ]
        }),
      });
    });
  });

  test("Should display wallet balances and transaction history correctly", async ({ page }: { page: Page }) => {
    await page.goto("/en/wallet");

    // Verify Wallet address
    await expect(page.locator(`text=${MOCK_ADDRESS.slice(0, 8)}`).first()).toBeVisible();

    // Verify Balances
    await expect(page.locator("text=5,000")).toBeVisible();
    await expect(page.locator("text=USDC").first()).toBeVisible();
    await expect(page.locator("text=100").first()).toBeVisible();
    await expect(page.locator("text=XLM").first()).toBeVisible();

    // Verify Transaction History (Assuming the UI displays "History" or similar)
    // The specifics depend on the implementation, but we can check for values
    await expect(page.locator("text=500").first()).toBeVisible();
  });
});
