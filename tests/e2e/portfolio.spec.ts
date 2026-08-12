import { expect, test, type Page } from "@playwright/test";

const chapterAnchors = [
  "opening",
  "experience",
  "projects",
  "about",
  "creative",
  "contact",
] as const;

async function setAutomotiveProgress(page: Page, progress: number) {
  await page.evaluate(async (nextProgress) => {
    const root = document.querySelector<HTMLElement>("[data-automotive-home]");
    if (!root) throw new Error("Automotive homepage was not mounted");

    const top = root.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(0, root.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: top + travel * nextProgress,
      behavior: "instant",
    });
    window.dispatchEvent(new Event("scroll"));

    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });
  }, progress);
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

test.describe("automotive portfolio", () => {
  test("exposes the complete six-chapter narrative without runtime video or reference media", async ({
    page,
  }) => {
    const forbiddenRequests: string[] = [];
    page.on("request", (request) => {
      const url = decodeURIComponent(request.url());
      if (/\/Images\//i.test(url)) forbiddenRequests.push(url);
    });

    await page.goto("/");

    const home = page.locator("[data-automotive-home]");
    await expect(home).toBeAttached();
    await expect(home).toHaveAttribute("data-ready", "true");
    await expect(page.locator('[data-scene="opening"]')).toBeVisible();
    await expect(page.locator('[data-shot="opening-body"]')).toBeVisible();
    await expect
      .poll(() =>
        page.locator('[data-shot="opening-body"] img').evaluate((image: HTMLImageElement) => ({
          complete: image.complete,
          width: image.naturalWidth,
        })),
      )
      .toMatchObject({ complete: true });
    await expect
      .poll(() =>
        page.locator('[data-shot="opening-body"] img').evaluate(
          (image: HTMLImageElement) => image.currentSrc,
        ),
      )
      .toMatch(/senna-body-macro-v1-(?:mobile|desktop)\.webp$/);

    for (const anchor of chapterAnchors) {
      await expect(page.locator(`#${anchor}`), `#${anchor}`).toHaveCount(1);
      await expect(
        page.locator(`[data-chapter-link][href="#${anchor}"]`),
        `chapter link for #${anchor}`,
      ).toHaveCount(1);
    }

    await expect(
      page.getByRole("heading", { name: "Systems under pressure." }),
    ).toBeAttached();
    await expect(
      page.getByRole("heading", { name: "Decisions at race speed." }),
    ).toBeAttached();
    await expect(
      page.getByRole("heading", { name: "Look beneath the surface." }),
    ).toBeAttached();

    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("video")).toHaveCount(0);
    await expect(page.locator("[autoplay]")).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('[aria-hidden="true"]')]
            .flatMap((container) => [
              ...container.querySelectorAll<HTMLElement>(
                'a[href], button, input, select, textarea, [tabindex]',
              ),
            ])
            .filter((element) => element.tabIndex >= 0 && !element.closest("[inert]"))
            .filter((element) => {
              const style = getComputedStyle(element);
              return style.display !== "none" && style.visibility !== "hidden";
            })
            .map((element) => element.textContent?.trim()),
        ),
      )
      .toEqual([]);
    await expect(page.locator("body")).not.toContainText(/dark vfx/i);
    await expect(page.locator("body")).not.toContainText(/psychological horror/i);

    for (const progress of [0.05, 0.2, 0.48, 0.7, 0.85, 0.97]) {
      await setAutomotiveProgress(page, progress);
    }

    await expect.poll(() => horizontalOverflow(page)).toBeLessThanOrEqual(1);
    const resourceRequests = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .map((entry) => decodeURIComponent(entry.name))
        .filter((name) => /\/Images\//i.test(name)),
    );
    expect(resourceRequests).toEqual([]);
    expect(forbiddenRequests).toEqual([]);
  });

  test("resolves the same chapter and shot at deterministic scroll positions and reverses to frame zero", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop scroll timeline check");
    await page.goto("/");

    const home = page.locator("[data-automotive-home]");
    await expect(home).toHaveAttribute("data-ready", "true");

    const checkpoints = [
      { progress: 0.05, chapter: "opening", shot: "identity" },
      { progress: 0.2, chapter: "senna", shot: "wheel" },
      { progress: 0.48, chapter: "f1", shot: "suspension" },
      { progress: 0.7, chapter: "skyline", shot: "skyline-hero" },
      { progress: 0.85, chapter: "creative", shot: "showreel" },
      { progress: 0.97, chapter: "contact", shot: "end-frame" },
    ] as const;

    for (const checkpoint of checkpoints) {
      await setAutomotiveProgress(page, checkpoint.progress);
      await expect
        .poll(() => home.getAttribute("data-active-chapter"))
        .toBe(checkpoint.chapter);
      await expect.poll(() => home.getAttribute("data-active-shot")).toBe(checkpoint.shot);
      await expect(
        page.locator(`[data-chapter-link="${checkpoint.chapter}"]`),
      ).toHaveAttribute("aria-current", "true");
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
    }

    await setAutomotiveProgress(page, 0.7);
    await expect.poll(() => home.getAttribute("data-active-shot")).toBe("skyline-hero");
    await setAutomotiveProgress(page, 0.05);
    await expect.poll(() => home.getAttribute("data-active-chapter")).toBe("opening");
    await expect.poll(() => home.getAttribute("data-active-shot")).toBe("identity");

    await setAutomotiveProgress(page, 0);
    await expect.poll(() => home.getAttribute("data-active-chapter")).toBe("opening");
    await expect.poll(() => home.getAttribute("data-active-shot")).toBe("darkness");
    await expect
      .poll(() =>
        home.evaluate((element) =>
          Number.parseFloat(element.style.getPropertyValue("--automotive-progress") || "1"),
        ),
      )
      .toBeLessThanOrEqual(0.001);
  });

  test("keeps premium heading typography unchanged on hover", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop pointer typography check");
    await page.goto("/");
    await expect(page.locator("[data-automotive-home]")).toHaveAttribute("data-ready", "true");
    await setAutomotiveProgress(page, 0.05);

    const heading = page.locator('[data-copy="opening-identity"] h1');
    await expect(heading).toBeVisible();

    const before = await heading.evaluate((element) => ({
      transform: getComputedStyle(element).transform,
      fontVariationSettings: getComputedStyle(element).fontVariationSettings,
      inlineStyle: element.getAttribute("style"),
    }));
    expect(before.transform).toBe("none");

    await heading.hover({ force: true });
    await page.waitForTimeout(220);

    const after = await heading.evaluate((element) => ({
      transform: getComputedStyle(element).transform,
      fontVariationSettings: getComputedStyle(element).fontVariationSettings,
      inlineStyle: element.getAttribute("style"),
    }));
    expect(after).toEqual(before);
  });

  test("keeps projects editorial and exposes an honest case study", async ({ page }) => {
    await page.goto("/projects");

    await expect(
      page.getByRole("heading", { level: 1, name: /systems in motion/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /f1 strategy engine/i })).toBeVisible();

    await page.getByRole("link", { name: /f1 strategy engine/i }).click();
    await expect(page).toHaveURL(/\/projects\/f1-strategy-engine$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /f1 strategy engine/i }),
    ).toBeVisible();
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

    const mobileMenu = page.getByRole("navigation", { name: "Mobile navigation" });
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(mobileMenu.getByRole("link", { name: /experience/i })).toBeVisible();
    await expect(mobileMenu.getByRole("link", { name: /projects/i })).toBeVisible();
    await expect(mobileMenu.getByRole("link", { name: /about/i })).toBeVisible();
    await expect(mobileMenu.getByRole("link", { name: /vfx \/ photography/i })).toBeVisible();
    await expect(mobileMenu.getByRole("link", { name: /résumé/i })).toBeVisible();
    await expect(mobileMenu.getByRole("link", { name: /contact/i })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(menuButton).toBeFocused();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  });

  test("manual reduced motion persists and exposes six editorial panels", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop experience control check");
    await page.goto("/");

    const motionControl = page.locator(".utility-button").filter({ hasText: "Motion" });
    await motionControl.click();
    await expect(motionControl).toHaveAttribute("aria-pressed", "true");

    const home = page.locator("[data-automotive-home]");
    await expect(home).toHaveAttribute("data-motion-mode", "reduced");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
    await expect(page.locator("[data-scene]").first()).toBeHidden();

    const reducedHeadings = [
      "Engineering in motion.",
      "Systems under pressure.",
      "Decisions at race speed.",
      "Look beneath the surface.",
      "Frames with intent.",
      "Let’s build what moves next.",
    ];
    for (const [index, anchor] of chapterAnchors.entries()) {
      const panel = page.locator(`#${anchor}`);
      await expect(panel.getByRole("heading", { name: reducedHeadings[index] })).toBeVisible();
    }

    await expect.poll(() => page.evaluate(() => localStorage.getItem("portfolio-motion"))).toBe(
      "reduced",
    );
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);

    await page.reload();
    await expect(page.locator("[data-automotive-home]")).toHaveAttribute(
      "data-motion-mode",
      "reduced",
    );
    await expect(page.locator("#experience").getByRole("heading")).toBeVisible();
  });

  test("every supporting route remains semantic, atmospheric, and overflow-free", async ({
    page,
  }) => {
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
      await expect(routePage.locator("[data-route-atmosphere]"), route).toBeAttached();
      expect(await horizontalOverflow(routePage), `${route} horizontal overflow`).toBeLessThanOrEqual(
        1,
      );
      await routePage.close();
    }

    expect(errors).toEqual([]);
  });
});
