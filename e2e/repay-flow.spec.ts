import { test, expect, type Page } from "@playwright/test";

const MOCK_ADDRESS = "GCJPBXSE6WCQDCEYZW6C3YVZCSSCHC4AE72L5KWKCYL2CLLL7NH5VSCI";

test.describe("Borrower: Repay Flow", () => {
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

    // Mock User Profile
    await page.route("**/api/user/profile", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user_borrower_1",
          email: "borrower@example.com",
          walletAddress: MOCK_ADDRESS,
          kycVerified: true,
        }),
      });
    });
  });

  test.skip("Should successfully repay an active loan", async ({ page }: { page: Page }) => {
    // Mock active loans for borrower
    await page.route("**/api/loans/borrower/**", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            borrower: MOCK_ADDRESS,
            loans: [
              {
                id: 123,
                principal: 1000,
                totalOwed: 500,
                status: "active",
                nextPaymentDeadline: "2026-12-31T00:00:00Z",
              },
            ],
          },
        }),
      });
    });

    await page.goto("/en");

    // Click repay on the specific loan
    const repayBtn = page.getByRole("button", { name: /Repay/i }).first();
    await repayBtn.click();

    // Perform repayment
    await expect(page.locator("text=Repayment Amount")).toBeVisible();
    await page.fill('input[type="number"]', "500");

    // Mock repayment finish
    await page.route("**/api/loans/123/repay", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, txHash: "tx_repay" }),
      });
    });

    await page.click('button:has-text("Review Repayment")');
    await page.click('button:has-text("Confirm Payment")');

    // Success message
    await expect(page.locator("text=Progress")).toBeVisible(); // transaction progress
    await expect(page.locator("text=Repayment Successful")).toBeVisible();
  });
});
