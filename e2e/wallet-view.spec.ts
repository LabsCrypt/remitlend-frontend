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
  });

  test("Should display wallet view and address correctly", async ({ page }: { page: Page }) => {
    await page.goto("/en/wallet");

    // Verify Wallet address is visible
    await expect(page.locator(`text=${MOCK_ADDRESS}`).first()).toBeVisible();

    // Verify Token Balances section is present
    await expect(page.locator("text=Token Balances")).toBeVisible();
    
    // Verify Transaction History section is present
    await expect(page.locator("text=Transaction History")).toBeVisible();
  });
});
