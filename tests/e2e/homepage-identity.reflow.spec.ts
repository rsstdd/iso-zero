import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectTextNotTruncated,
  gotoIdentityFixture,
  HOMEPAGE_IDENTITY_CONTRACT,
  identity,
  identityByline,
  identityTitle,
  renderedTextLineCount,
} from "./support/homepage-identity";

test.describe("HomepageIdentity reflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 1000 });
  });

  test("remains exactly two visible text lines at the 320 CSS px baseline", async ({ page }) => {
    await gotoIdentityFixture(page);

    await expect(identityTitle(page)).toHaveText(HOMEPAGE_IDENTITY_CONTRACT.title);
    await expect(identityByline(page)).toHaveText(HOMEPAGE_IDENTITY_CONTRACT.byline);
    expect(await renderedTextLineCount(identityTitle(page))).toBe(1);
    expect(await renderedTextLineCount(identityByline(page))).toBe(1);

    const boxes = await identity(page)
      .locator(":scope > h1, :scope > p")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          return { bottom: box.bottom, top: box.top };
        }),
      );
    expect(boxes).toHaveLength(2);
    expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom);
    await expectTextNotTruncated(identity(page));
    await expectNoHorizontalOverflow(page);
  });

  test("preserves complete copy and order under 200 percent text enlargement", async ({ page }) => {
    await gotoIdentityFixture(page);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });

    await expect(identityTitle(page)).toHaveText(HOMEPAGE_IDENTITY_CONTRACT.title);
    await expect(identityByline(page)).toHaveText(HOMEPAGE_IDENTITY_CONTRACT.byline);
    await expectTextNotTruncated(identity(page));
    await expectNoHorizontalOverflow(page);

    const order = await identity(page)
      .locator(":scope > h1, :scope > p")
      .evaluateAll((elements) =>
        elements.map((element) => ({
          cssOrder: getComputedStyle(element).order,
          tag: element.tagName,
          top: element.getBoundingClientRect().top,
        })),
      );
    expect(order.map(({ cssOrder }) => cssOrder)).toEqual(["0", "0"]);
    expect(order.map(({ tag }) => tag)).toEqual(["H1", "P"]);
    expect(order[1].top).toBeGreaterThan(order[0].top);
  });

  test("survives WCAG text spacing without overlap, clipping, or reordering", async ({ page }) => {
    await gotoIdentityFixture(page);
    await page.addStyleTag({
      content: `
        .homepage-identity,
        .homepage-identity * {
          line-height: 1.5 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        }

        .homepage-identity p {
          margin-block-start: 2em !important;
        }
      `,
    });

    await expectTextNotTruncated(identity(page));
    await expectNoHorizontalOverflow(page);
    const boxes = await identity(page)
      .locator(":scope > h1, :scope > p")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          return { bottom: box.bottom, top: box.top };
        }),
      );
    expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom);
  });

  test("retains legible hierarchy and complete DOM text when custom fonts fail", async ({
    page,
  }) => {
    await page.route(/\.(?:woff2?|ttf)(?:\?.*)?$/i, (route) => route.abort());
    await gotoIdentityFixture(page);

    await expect(identityTitle(page)).toBeVisible();
    await expect(identityByline(page)).toBeVisible();
    await expect(identityTitle(page)).toHaveText(HOMEPAGE_IDENTITY_CONTRACT.title);
    await expect(identityByline(page)).toHaveText(HOMEPAGE_IDENTITY_CONTRACT.byline);
    await expectTextNotTruncated(identity(page));
    await expectNoHorizontalOverflow(page);

    const stacks = await Promise.all([
      identityTitle(page).evaluate((element) => getComputedStyle(element).fontFamily.toLowerCase()),
      identityByline(page).evaluate((element) =>
        getComputedStyle(element).fontFamily.toLowerCase(),
      ),
    ]);
    expect(stacks[0]).toContain("serif");
    expect(stacks[1]).toContain("sans-serif");

    const sizes = await Promise.all([
      identityTitle(page).evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).fontSize),
      ),
      identityByline(page).evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).fontSize),
      ),
    ]);
    expect(sizes[0]).toBeGreaterThan(sizes[1]);
  });
});
