import { test, expect } from "@playwright/test";

test.describe("Visual regression", () => {
  test("hero section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".hero")).toHaveScreenshot("hero.png", {
      maxDiffPixels: 100,
    });
  });

  test("portfolio section", async ({ page }) => {
    await page.goto("/");
    await page.locator("#web").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // Wait for card animations
    await expect(page.locator("#web")).toHaveScreenshot("portfolio-web.png", {
      maxDiffPixels: 100,
    });
  });

  test("footer section", async ({ page }) => {
    await page.goto("/");
    await page.locator("#contacts").scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".footer")).toHaveScreenshot("footer.png", {
      maxDiffPixels: 100,
    });
  });
});
