import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  AUTOMOTIVE_EDIT,
  resolveAutomotiveTimeline,
  type AutomotiveChapterId,
  type AutomotiveShotId,
} from "../../lib/automotive-timeline";

const chapterAnchors = [
  "about",
  "experience",
  "projects",
  "creative",
  "contact",
] as const satisfies readonly AutomotiveChapterId[];

const chapterHeadings: Record<AutomotiveChapterId, string> = {
  about: "Aayu Pratap Singh — Engineer & Founder",
  experience: "Work that holds pressure.",
  projects: "Decisions at race speed.",
  creative: "Images with intent.",
  contact: "Let’s build what moves next.",
};

const chapterActionHrefs: Record<AutomotiveChapterId, string> = {
  about: "/about",
  experience: "/experience",
  projects: "/projects",
  creative: "/archive",
  contact: "mailto:aayupsuw@gmail.com",
};

const editProgress = (unit: number) => unit / AUTOMOTIVE_EDIT.total;

async function setAutomotiveProgress(page: Page, progress: number) {
  await page.evaluate(async (nextProgress) => {
    const root = document.querySelector<HTMLElement>("[data-automotive-home]");
    if (!root) throw new Error("Automotive homepage was not mounted");

    const top = root.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(0, root.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: top + travel * Math.min(1, Math.max(0, nextProgress)),
      behavior: "instant",
    });
    window.dispatchEvent(new Event("scroll"));

    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve());
        });
      });
    });
  }, progress);
}

async function expectTimelineState(
  page: Page,
  home: Locator,
  chapter: AutomotiveChapterId,
  shot: AutomotiveShotId,
) {
  await expect
    .poll(async () => ({
      chapter: await home.getAttribute("data-active-chapter"),
      shot: await home.getAttribute("data-active-shot"),
    }))
    .toEqual({ chapter, shot });
  await expect(page.locator(`[data-chapter-link="${chapter}"]`)).toHaveAttribute(
    "aria-current",
    "location",
  );
  await expect(page.locator(`[data-action-chapter="${chapter}"]`).first()).toBeVisible();
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

async function doorCanvasSignature(page: Page) {
  return page
    .locator('canvas[data-door-sequence][data-sequence-kind="open-door-camera-push"]')
    .evaluate((element) => {
      if (!(element instanceof HTMLCanvasElement) || element.width < 2 || element.height < 2) {
        return null;
      }

      const sample = document.createElement("canvas");
      sample.width = 24;
      sample.height = 14;
      const context = sample.getContext("2d", { willReadFrequently: true });
      if (!context) return null;
      context.drawImage(element, 0, 0, sample.width, sample.height);
      const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
      let hash = 2166136261;
      let minimum = 255;
      let maximum = 0;

      for (let index = 0; index < pixels.length; index += 4) {
        for (let channel = 0; channel < 3; channel += 1) {
          const value = pixels[index + channel];
          minimum = Math.min(minimum, value);
          maximum = Math.max(maximum, value);
          hash ^= value;
          hash = Math.imul(hash, 16777619);
        }
      }

      return maximum - minimum > 8 ? String(hash >>> 0) : null;
    });
}

test.describe("automotive portfolio", () => {
  test("uses the exact five-chapter production edit", () => {
    expect(AUTOMOTIVE_EDIT).toEqual({
      total: 285,
      aboutEnd: 56,
      experienceEnd: 136,
      projectsEnd: 224,
      creativeEnd: 266,
      engineInspectionStart: 29.2,
      engineInspectionEnd: 54.8,
      doorStart: 110,
      doorEnd: 126,
    });

    const exactBoundaries = [
      { unit: 0, chapter: "about", shot: "identity" },
      { unit: AUTOMOTIVE_EDIT.aboutEnd, chapter: "experience", shot: "senna-carbon" },
      { unit: AUTOMOTIVE_EDIT.experienceEnd, chapter: "projects", shot: "tyre-match" },
      { unit: AUTOMOTIVE_EDIT.projectsEnd, chapter: "creative", shot: "aperture" },
      { unit: AUTOMOTIVE_EDIT.creativeEnd, chapter: "contact", shot: "end-frame" },
      { unit: AUTOMOTIVE_EDIT.total, chapter: "contact", shot: "end-frame" },
    ] as const satisfies ReadonlyArray<{
      unit: number;
      chapter: AutomotiveChapterId;
      shot: AutomotiveShotId;
    }>;

    for (const boundary of exactBoundaries) {
      expect(resolveAutomotiveTimeline(editProgress(boundary.unit))).toMatchObject({
        chapterId: boundary.chapter,
        shotId: boundary.shot,
      });
    }
  });

  test("exposes the complete About-first narrative without video or reference media", async ({
    page,
  }) => {
    test.slow();
    const forbiddenRequests: string[] = [];
    page.on("request", (request) => {
      const url = decodeURIComponent(request.url());
      if (/\/Images\//i.test(url)) forbiddenRequests.push(url);
    });

    await page.goto("/");

    const home = page.locator("[data-automotive-home]");
    await expect(home).toBeAttached();
    await expect(home).toHaveAttribute("data-ready", "true");
    await expect(home).toHaveAttribute("data-intro-ready", "true");
    await expect(page.locator('[aria-hidden="true"] [data-scene="about"]')).toBeVisible();
    await expect(page.locator('[data-shot="skyline-intro"]')).toBeVisible();
    await expect(page.locator('[data-automotive-home] > [aria-hidden="true"]').first()).toBeHidden();

    const hero = page.locator('[data-shot="skyline-intro"] img');
    await expect
      .poll(() =>
        hero.evaluate((image: HTMLImageElement) => ({
          complete: image.complete,
          width: image.naturalWidth,
        })),
      )
      .toMatchObject({ complete: true });
    await expect.poll(() => hero.evaluate((image: HTMLImageElement) => image.currentSrc)).toMatch(
      /skyline-hero-rear-three-quarter-v2-(?:mobile|desktop)\.webp(?:$|\?)/,
    );

    for (const anchor of chapterAnchors) {
      await expect(page.locator(`#${anchor}`), `#${anchor}`).toHaveCount(1);
      await expect(
        page.locator(`[data-chapter-link="${anchor}"][href="#${anchor}"]`),
        `chapter link for #${anchor}`,
      ).toHaveCount(1);
      await expect(page.locator(`[data-chapter-link="${anchor}"]`)).toHaveAttribute(
        "aria-label",
        `Jump to ${anchor[0].toUpperCase()}${anchor.slice(1)}`,
      );
      await expect(
        page.locator(`#${anchor}`).getByRole("heading", { name: chapterHeadings[anchor] }),
      ).toBeAttached();
    }

    const shortcutDock = page.getByRole("navigation", { name: "Portfolio shortcuts" });
    await expect(shortcutDock).toBeVisible();
    await expect(shortcutDock.locator("a")).toHaveCount(7);
    await expect(page.locator('[data-action-chapter="about"]')).toBeVisible();
    for (const chapter of chapterAnchors) {
      await expect(page.locator(`[data-action-chapter="${chapter}"]`).first()).toHaveAttribute(
        "href",
        chapterActionHrefs[chapter],
      );
    }

    const railTargets = await page.locator("[data-chapter-link]").evaluateAll((links) =>
      links.map((link) => {
        const rect = link.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }),
    );
    expect(railTargets).toHaveLength(chapterAnchors.length);
    for (const target of railTargets) {
      expect(target.width).toBeGreaterThanOrEqual(44);
      expect(target.height).toBeGreaterThanOrEqual(44);
    }

    const measuredChapterStarts = await page.evaluate((ids) => {
      const root = document.querySelector<HTMLElement>("[data-automotive-home]");
      if (!root) throw new Error("Automotive homepage was not mounted");
      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, root.offsetHeight - window.innerHeight);
      return ids.map((id) => {
        const section = document.getElementById(id);
        if (!section) throw new Error(`Missing #${id}`);
        const sectionTop = section.getBoundingClientRect().top + window.scrollY - rootTop;
        return sectionTop / travel;
      });
    }, chapterAnchors);
    const expectedChapterStarts = [
      0,
      editProgress(AUTOMOTIVE_EDIT.aboutEnd),
      editProgress(AUTOMOTIVE_EDIT.experienceEnd),
      editProgress(AUTOMOTIVE_EDIT.projectsEnd),
      editProgress(AUTOMOTIVE_EDIT.creativeEnd),
    ];
    measuredChapterStarts.forEach((measured, index) => {
      expect(Math.abs(measured - expectedChapterStarts[index])).toBeLessThan(0.002);
    });

    await expect(page.locator("canvas")).toHaveCount(2);
    await expect(page.locator('canvas[data-door-sequence][data-sequence-kind="door-state-motion"][aria-hidden="true"]')).toHaveCount(1);
    await expect(page.locator('canvas[data-door-sequence][data-sequence-kind="open-door-camera-push"][aria-hidden="true"]')).toHaveCount(1);
    await expect(page.locator('[data-engine-model]')).toHaveCount(0);
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

    for (const unit of [
      8,
      AUTOMOTIVE_EDIT.aboutEnd + 2,
      AUTOMOTIVE_EDIT.experienceEnd + 2,
      AUTOMOTIVE_EDIT.projectsEnd + 2,
      AUTOMOTIVE_EDIT.creativeEnd + 2,
    ]) {
      await setAutomotiveProgress(page, editProgress(unit));
    }
    await setAutomotiveProgress(page, 1);
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

  test("resolves deterministic forward and reverse chapter and shot state", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop scroll timeline check");
    test.slow();
    await page.goto("/");

    const home = page.locator("[data-automotive-home]");
    await expect(home).toHaveAttribute("data-ready", "true");

    const checkpoints = [
      { unit: 0, chapter: "about", shot: "identity" },
      {
        unit: (AUTOMOTIVE_EDIT.engineInspectionStart + AUTOMOTIVE_EDIT.engineInspectionEnd) / 2,
        chapter: "about",
        shot: "engine-inspection",
      },
      { unit: AUTOMOTIVE_EDIT.aboutEnd + 1, chapter: "experience", shot: "senna-carbon" },
      {
        unit: (AUTOMOTIVE_EDIT.doorStart + AUTOMOTIVE_EDIT.doorEnd) / 2 + 1,
        chapter: "experience",
        shot: "open-door-camera-push",
      },
      { unit: AUTOMOTIVE_EDIT.experienceEnd + 1, chapter: "projects", shot: "tyre-match" },
      { unit: AUTOMOTIVE_EDIT.experienceEnd + 44, chapter: "projects", shot: "ferrari-suspension" },
      { unit: AUTOMOTIVE_EDIT.projectsEnd + 1, chapter: "creative", shot: "aperture" },
      { unit: AUTOMOTIVE_EDIT.projectsEnd + 20, chapter: "creative", shot: "vfx" },
      { unit: AUTOMOTIVE_EDIT.creativeEnd + 1, chapter: "contact", shot: "end-frame" },
    ] as const satisfies ReadonlyArray<{
      unit: number;
      chapter: AutomotiveChapterId;
      shot: AutomotiveShotId;
    }>;

    for (const checkpoint of checkpoints) {
      await setAutomotiveProgress(page, editProgress(checkpoint.unit));
      await expectTimelineState(page, home, checkpoint.chapter, checkpoint.shot);
    }

    for (const checkpoint of [...checkpoints].reverse()) {
      await setAutomotiveProgress(page, editProgress(checkpoint.unit));
      await expectTimelineState(page, home, checkpoint.chapter, checkpoint.shot);
    }

    await setAutomotiveProgress(page, 0);
    await expectTimelineState(page, home, "about", "identity");
    await expect
      .poll(() =>
        home.evaluate((element) =>
          Number.parseFloat(element.style.getPropertyValue("--automotive-progress") || "1"),
        ),
      )
      .toBeLessThanOrEqual(0.001);
  });

  test("scrubs the door sequence forward and back to its first frame", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop canvas sequence check");
    test.slow();
    await page.goto("/");

    const home = page.locator("[data-automotive-home]");
    await expect(home).toHaveAttribute("data-ready", "true");

    const door = page.locator('canvas[data-door-sequence][data-sequence-kind="open-door-camera-push"]');
    await setAutomotiveProgress(page, editProgress(AUTOMOTIVE_EDIT.doorEnd + 0.25));
    await expectTimelineState(page, home, "experience", "open-door-camera-push");
    await expect(door).toHaveAttribute("data-frame", "31");
    await expect.poll(() => doorCanvasSignature(page), { timeout: 20_000 }).not.toBeNull();
    const openSignature = await doorCanvasSignature(page);
    expect(openSignature).not.toBeNull();

    await setAutomotiveProgress(page, editProgress(AUTOMOTIVE_EDIT.doorStart - 1));
    await expect(door).toHaveAttribute("data-frame", "0");
    const closedSignature = await doorCanvasSignature(page);
    expect(closedSignature).not.toBeNull();

    await setAutomotiveProgress(page, editProgress(AUTOMOTIVE_EDIT.doorEnd + 0.25));
    await expect(door).toHaveAttribute("data-frame", "31");
    await setAutomotiveProgress(page, editProgress(AUTOMOTIVE_EDIT.doorStart - 1));
    await expect(door).toHaveAttribute("data-frame", "0");
  });

  test("keeps premium heading typography unchanged on hover", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop pointer typography check");
    await page.goto("/");
    await expect(page.locator("[data-automotive-home]")).toHaveAttribute("data-ready", "true");
    await setAutomotiveProgress(page, editProgress(8));

    const heading = page.locator('[data-copy="about-identity"] h1');
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
    const strategyLink = page.getByRole("link", { name: /f1 strategy engine/i });
    await expect(strategyLink).toBeVisible();
    await strategyLink.click();
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

  test("mobile navigation remains About-first, keyboard accessible, and touch accessible", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile-only navigation check");
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: "Menu", exact: true });
    await expect(menuButton).toHaveCount(1);
    await menuButton.click();

    await expect(page.locator(".menu-button")).toHaveAttribute("aria-expanded", "true");
    const mobileMenu = page.getByRole("navigation", { name: "Mobile navigation" });
    await expect(mobileMenu).toBeVisible();
    const mobileHrefs = await mobileMenu.locator("a").evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    );
    expect(mobileHrefs).toEqual([
      "/about",
      "/experience",
      "/projects",
      "/archive",
      "/resume",
      "/contact",
    ]);
    for (const label of [
      /about/i,
      /experience/i,
      /projects/i,
      /vfx \/ photography/i,
      /résumé/i,
      /contact/i,
    ]) {
      await expect(mobileMenu.getByRole("link", { name: label })).toBeVisible();
    }

    await page.keyboard.press("Escape");
    const closedMenuButton = page.getByRole("button", { name: "Menu", exact: true });
    await expect(closedMenuButton).toHaveAttribute("aria-expanded", "false");
    await expect(closedMenuButton).toBeFocused();
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
  });

  test("manual reduced motion persists and exposes five semantic editorial panels", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "desktop experience control check");
    await page.goto("/");

    const motionControl = page.locator(".utility-button").filter({ hasText: "Motion" });
    await expect(motionControl).toHaveCount(1);
    await motionControl.click();
    await expect(motionControl).toHaveAttribute("aria-pressed", "true");

    const home = page.locator("[data-automotive-home]");
    await expect(home).toHaveAttribute("data-motion-mode", "reduced");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
    await expect(page.locator('[data-scene="about"]')).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Portfolio shortcuts" })).toBeHidden();

    for (const anchor of chapterAnchors) {
      const panel = page.locator(`#${anchor}`);
      await expect(panel.getByRole("heading", { name: chapterHeadings[anchor] })).toBeVisible();
      const action = panel.locator(`a[href="${chapterActionHrefs[anchor]}"]`);
      await expect(action).toBeVisible();
      expect(await action.evaluate((element) => element.closest("[inert]") === null)).toBe(true);
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
