import { expect, type Locator, test } from "@playwright/test";
import {
  expectLinkTargetAtLeast,
  expectNoHorizontalOverflow,
  expectTextNotClipped,
  galleriesLink,
  gotoRoute,
  siteHeader,
  wordmark,
} from "./support/site-header";

test.describe("SiteHeader reflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await gotoRoute(page);
  });

  test("keeps both destinations visible and ordered at 320 CSS px", async ({ page }) => {
    const header = siteHeader(page);
    const home = wordmark(page);
    const galleries = galleriesLink(page);

    await expect(home).toBeVisible();
    await expect(galleries).toBeVisible();
    await expectVisualOrder(home, galleries);

    const layoutOrder = await header
      .locator(":scope > *")
      .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).order));
    expect(layoutOrder).toEqual(["0", "0"]);

    for (const link of await header.getByRole("link").all()) {
      await expectLinkTargetAtLeast(link);
    }
    await expectTextNotClipped(header.getByRole("link"));
    await expectNoHorizontalOverflow(page);
  });

  test("grows instead of clipping at 200 percent text enlargement", async ({ page }) => {
    await page.addStyleTag({
      content: `
        html {
          font-size: 200% !important;
        }
      `,
    });

    const header = siteHeader(page);
    const home = wordmark(page);
    const galleries = galleriesLink(page);

    await expect(home).toBeVisible();
    await expect(galleries).toBeVisible();
    await expectVisualOrder(home, galleries);
    await expectTextNotClipped(header.getByRole("link"));
    await expectLinksInsideHeader(header);
    await expectNoHorizontalOverflow(page);
  });

  test("survives WCAG text spacing without overlap or truncation", async ({ page }) => {
    await page.addStyleTag({
      content: `
        header.site-header,
        header.site-header * {
          line-height: 1.5 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        }
      `,
    });

    const header = siteHeader(page);
    const home = wordmark(page);
    const galleries = galleriesLink(page);

    await expectVisualOrder(home, galleries);
    await expectTextNotClipped(header.getByRole("link"));
    await expectLinksInsideHeader(header);
    await expectNoHorizontalOverflow(page);
  });
});

async function expectVisualOrder(first: Locator, second: Locator): Promise<void> {
  const [firstBox, secondBox] = await Promise.all([first.boundingBox(), second.boundingBox()]);
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();

  const boxesShareALine =
    (firstBox?.y ?? 0) < (secondBox?.y ?? 0) + (secondBox?.height ?? 0) &&
    (secondBox?.y ?? 0) < (firstBox?.y ?? 0) + (firstBox?.height ?? 0);
  const firstPrecedesSecond = boxesShareALine
    ? (firstBox?.x ?? 0) < (secondBox?.x ?? 0)
    : (firstBox?.y ?? 0) < (secondBox?.y ?? 0);
  expect(firstPrecedesSecond, "Wordmark must remain visually before Galleries").toBe(true);
}

async function expectLinksInsideHeader(header: Locator): Promise<void> {
  const result = await header.evaluate((element) => {
    const headerBox = element.getBoundingClientRect();
    const linkBoxes = Array.from(element.querySelectorAll("a"), (link) =>
      link.getBoundingClientRect(),
    );
    return {
      header: {
        bottom: headerBox.bottom,
        left: headerBox.left,
        right: headerBox.right,
        top: headerBox.top,
      },
      links: linkBoxes.map((box) => ({
        bottom: box.bottom,
        left: box.left,
        right: box.right,
        top: box.top,
      })),
      overflow: getComputedStyle(element).overflow,
    };
  });

  expect(result.overflow).not.toBe("hidden");
  for (const box of result.links) {
    expect(box.left).toBeGreaterThanOrEqual(result.header.left - 1);
    expect(box.right).toBeLessThanOrEqual(result.header.right + 1);
    expect(box.top).toBeGreaterThanOrEqual(result.header.top - 1);
    expect(box.bottom).toBeLessThanOrEqual(result.header.bottom + 1);
  }
}
