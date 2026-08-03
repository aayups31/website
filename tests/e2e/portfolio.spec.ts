import { expect, test } from "@playwright/test";

test.describe("portfolio experience", () => {
  test("presents the complete cinematic narrative without fabricated visual work", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /the work behind the moment/i }),
    ).toBeVisible();
    await expect(page.locator("[data-world=football]")).toBeAttached();
    await expect(page.locator("[data-world=racing]")).toBeAttached();
    await expect(page.locator("[data-world=music]")).toBeAttached();
    await expect(page.locator("[data-world=archive]")).toBeAttached();
    await expect(page.getByText("Final credited media pending").first()).toBeAttached();
    await expect(page.locator("[data-cinematic-worlds]")).toBeAttached();
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Linkin Park" })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Hans Zimmer" })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Michael Jackson" })).toBeAttached();
    await expect
      .poll(() =>
        page
          .locator(".cinematic-world--prologue img")
          .first()
          .evaluate((image: HTMLImageElement) => image.naturalWidth),
      )
      .toBeGreaterThan(0);
    await expect(page.locator("body")).not.toContainText(/dark vfx/i);
    await expect(page.locator("body")).not.toContainText(/psychological horror/i);

    await page.locator("#music").scrollIntoViewIfNeeded();
    await expect(page.locator("html")).toHaveAttribute("data-world", "music");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("keeps projects editorial and exposes an honest case study", async ({ page }) => {
    await page.goto("/projects");

    await expect(page.getByRole("heading", { level: 1, name: /systems in motion/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /f1 strategy engine/i })).toBeVisible();

    await page.getByRole("link", { name: /f1 strategy engine/i }).click();
    await expect(page).toHaveURL(/\/projects\/f1-strategy-engine$/);
    await expect(page.getByRole("heading", { level: 1, name: /f1 strategy engine/i })).toBeVisible();
    await expect(page.getByText(/without inventing race-prediction accuracy/i)).toBeVisible();
  });

  test("labels every archive study as placeholder media", async ({ page }) => {
    await page.goto("/archive");

    const archiveItems = page.locator(".archive-item");
    await expect(archiveItems).toHaveCount(4);
    await expect(page.getByText(/placeholder · final media pending/i)).toHaveCount(4);
    await expect(page.getByText(/no invented client work/i)).toBeVisible();
  });

  test("mobile navigation remains keyboard and touch accessible", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile-only navigation check");
    await page.goto("/");

    const menuButton = page.locator(".menu-button");
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toContainText("Menu");
    await menuButton.click();
    await expect(page.getByRole("link", { name: /vfx \/ photography/i })).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(menuButton).toBeFocused();
  });

  test("manual reduced motion persists and applies globally", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop experience control check");
    await page.goto("/");

    const motionControl = page.locator(".utility-button").filter({ hasText: "Motion" });
    await motionControl.click();
    await expect(motionControl).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
    await expect(page.locator(".cinematic-layer").first()).toHaveCSS("transform", "none");
    await expect.poll(() => page.evaluate(() => localStorage.getItem("portfolio-motion"))).toBe(
      "reduced",
    );
  });

  test("every public route responds without a page error", async ({ page }) => {
    const errors: string[] = [];

    for (const route of [
      "/experience",
      "/projects",
      "/projects/unimarket",
      "/about",
      "/archive",
      "/resume",
      "/contact",
    ]) {
      const routePage = await page.context().newPage();
      routePage.on("pageerror", (error) => errors.push(`${route}: ${error.message}`));
      const response = await routePage.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), route).toBeLessThan(400);
      await expect(routePage.locator("main#main-content"), route).toBeVisible();
      await routePage.close();
    }

    expect(errors).toEqual([]);
  });
});
