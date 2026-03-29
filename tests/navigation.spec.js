import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("hero section is visible on load", async ({ page }) => {
    await expect(page.locator(".hero")).toBeVisible();
    await expect(page.locator(".hero__headline")).toContainText(
      "Depth-first versatility",
    );
  });

  test("View Portfolio button scrolls to portfolio section", async ({
    page,
  }) => {
    await page.click(".hero__btn--view");
    await expect(page).toHaveURL(/#portfolio/);
    await expect(page.locator("#portfolio")).toBeInViewport();
  });

  test("Contact button scrolls to footer", async ({ page }) => {
    await page.click(".hero__btn--contact");
    await expect(page).toHaveURL(/#contacts/);
    await expect(page.locator("#contacts")).toBeInViewport();
  });

  test("Resume button has correct attributes", async ({ page }) => {
    const btn = page.locator(".hero__btn--resume");
    await expect(btn).toContainText("See Resume");
    await expect(btn).toBeEnabled();
  });

  test("nav links highlight when section is in view", async ({ page }) => {
    await page.click(".hero__btn--view");

    // Scroll to web section
    await page.locator("#web").scrollIntoViewIfNeeded();
    await expect(page.locator(".nav-link.web")).toHaveClass(/active/);

    // Scroll to mobile section
    await page.locator("#mobile").scrollIntoViewIfNeeded();
    await expect(page.locator(".nav-link.mobile")).toHaveClass(/active/);

    // Scroll to misc section
    await page.locator("#misc").scrollIntoViewIfNeeded();
    await expect(page.locator(".nav-link.misc")).toHaveClass(/active/);
  });

  test("home button returns to top", async ({ page }) => {
    await page.click(".hero__btn--view");
    await page.waitForURL(/#portfolio/);

    await page.click(".nav__home-btn");
    // Home button navigates to "#" which is the top of the page
    await expect(page).toHaveURL(/#$/);
  });
});

test.describe("Project cards", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click(".hero__btn--view");
  });

  test("cards animate into view on scroll", async ({ page }) => {
    const card = page.locator(".card").first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/display/);
  });

  test("project links are functional", async ({ page }) => {
    const repoLink = page.locator(".card__project-link").first();
    await expect(repoLink).toHaveAttribute("href", /github\.com/);
    await expect(repoLink).toHaveAttribute("target", "_blank");
  });
});

test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("social links are present and functional", async ({ page }) => {
    const linkedin = page.locator(".social-link").first();
    await expect(linkedin).toHaveAttribute("href", /linkedin\.com/);

    const github = page.locator(".social-link").nth(1);
    await expect(github).toHaveAttribute("href", /github\.com/);

    const email = page.locator(".social-link").nth(2);
    await expect(email).toHaveAttribute("href", /mailto:/);
  });
});
