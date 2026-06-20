import { test, expect, type Page } from "@playwright/test";

const MOCK_ADDRESS = "GCJPBXSE6WCQDCEYZW6C3YVZCSSCHC4AE72L5KWKCYL2CLLL7NH5VSCI";

test.describe("Lend: Deposit and Withdraw Flow", () => {
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

    // Mock initial Pool Stats
    await page.route("**/api/pool/stats", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            totalDeposits: 1000000,
            totalOutstanding: 450000,
            utilizationRate: 0.45,
            apy: 0.12,
            activeLoansCount: 154,
          },
        }),
      });
    });
  });

  test("Should complete a full deposit and withdraw cycle", async ({ page }: { page: Page }) => {
    await page.goto("/en/lend");

    // Verify initial pool stats
    await expect(page.locator("text=1,000,000")).toBeVisible();

    // ─── DEPOSIT ─────────────────────────────────────────────────────────────
    // Mock deposit submission
    await page.route("**/api/pool/deposit", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, txHash: "tx_dep" }),
      });
    });

    // We will update the pool stats mock to reflect the deposit
    await page.route("**/api/pool/stats", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            totalDeposits: 1002500, // +$2500
            totalOutstanding: 450000,
            utilizationRate: 0.448,
            apy: 0.12,
            activeLoansCount: 154,
          },
        }),
      });
    });

    // Assume there is a deposit amount input placeholder '0.00' (from existing criticalFlows test)
    await page.fill('input[placeholder="0.00"]', "2500");
    const depositBtn = page.getByRole("button", { name: /^Deposit$/ });
    await depositBtn.click();

    // Verify UI reflects deposit (maybe pool stats updated)
    await expect(page.locator("text=1,002,500")).toBeVisible();

    // ─── WITHDRAW ────────────────────────────────────────────────────────────
    // Mock withdraw submission
    await page.route("**/api/pool/withdraw", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, txHash: "tx_with" }),
      });
    });

    // Update pool stats mock to reflect the withdrawal
    await page.route("**/api/pool/stats", async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            totalDeposits: 1002000, // -$500
            totalOutstanding: 450000,
            utilizationRate: 0.449,
            apy: 0.12,
            activeLoansCount: 154,
          },
        }),
      });
    });

    // The UI likely has a "Withdraw" tab or a section with "Withdraw Amount"
    // Let's click "Withdraw" tab if it exists
    const withdrawTab = page.getByRole("tab", { name: /Withdraw/i });
    if (await withdrawTab.isVisible()) {
      await withdrawTab.click();
    }

    // Input the withdraw amount
    // Let's use a selector that is likely for withdraw if there are multiple inputs
    const withdrawInput = page.locator('input[placeholder="0.00"]').last();
    await withdrawInput.fill("500");

    const withdrawBtn = page.getByRole("button", { name: /^Withdraw$/ });
    await withdrawBtn.click();

    // Verify UI reflects withdrawal
    await expect(page.locator("text=1,002,000")).toBeVisible();
  });
});
