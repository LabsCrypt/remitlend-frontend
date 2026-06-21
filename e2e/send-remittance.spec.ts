import { test, expect, type Page } from "@playwright/test";

const MOCK_ADDRESS = "GCJPBXSE6WCQDCEYZW6C3YVZCSSCHC4AE72L5KWKCYL2CLLL7NH5VSCI";

test.describe("Send Remittance Flow", () => {
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

    // Mock fiat rates
    await page.route("**/api/rates*", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { NGN: 1500, EUR: 0.92, GBP: 0.78 },
        }),
      });
    });
  });

  test("Should successfully render send remittance form without strict mode violation", async ({ page }: { page: Page }) => {
    await page.goto("/en/send-remittance");

    // Verify page loaded - using .first() to fix strict mode violation
    await expect(page.getByRole("heading", { name: /Send Remittance/i }).first()).toBeVisible();

    // Verify FAQ exists
    await expect(page.locator("text=Frequently Asked Questions")).toBeVisible();
  });
});
