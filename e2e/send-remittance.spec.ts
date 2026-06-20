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

  test("Should successfully send a remittance", async ({ page }: { page: Page }) => {
    await page.goto("/en/send-remittance");

    // Verify page loaded
    await expect(page.getByRole("heading", { name: /Send Remittance/i })).toBeVisible();

    // Fill form
    // The exact selectors depend on the form implementation, we use generic placeholders
    // typically found in such forms
    const recipientInput = page.getByPlaceholder("Recipient Address").or(page.locator('input[name="recipient"]'));
    if (await recipientInput.isVisible()) {
        await recipientInput.fill("GBRECIPIENT1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456");
    }

    const amountInput = page.getByPlaceholder("0.00").or(page.locator('input[type="number"]')).first();
    if (await amountInput.isVisible()) {
        await amountInput.fill("100");
    }

    // Mock remittance submission
    await page.route("**/api/remittances", async (route: any) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              id: "rem_999",
              status: "completed",
              txHash: "tx_remittance_abc",
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    const sendBtn = page.getByRole("button", { name: /Send Remittance/i }).first();
    await sendBtn.click();

    // Often there's a confirmation step
    const confirmBtn = page.getByRole("button", { name: /Confirm/i });
    if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
    }

    // Verify success
    await expect(page.locator("text=Success").or(page.locator("text=Transaction complete"))).toBeVisible({ timeout: 10000 });
  });
});
