import { expect, test } from "@playwright/test";
import {
  DATA_PLATE_CONTRACT,
  expectNoHorizontalOverflow,
  expectTextNotTruncated,
  gotoDataPlateFixture,
  longPlate,
} from "./support/data-plate";

test.describe("DataPlate reflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 1000 });
  });

  test("wraps long metadata without clipping or horizontal scrolling at 320 CSS px", async ({
    page,
  }) => {
    await gotoDataPlateFixture(page);
    const plate = longPlate(page);

    await expect(plate).toBeVisible();
    await expect(plate.locator("dt")).toHaveText([...DATA_PLATE_CONTRACT.longTerms]);
    await expect(plate.locator("dd")).toHaveText([...DATA_PLATE_CONTRACT.longValues]);
    await expectTextNotTruncated(plate);
    await expectNoHorizontalOverflow(page, plate);
  });

  test("preserves term-value source and visual order through narrow reflow", async ({ page }) => {
    await gotoDataPlateFixture(page);
    const rows = longPlate(page).locator("dl > div");
    await expect(rows).toHaveCount(DATA_PLATE_CONTRACT.longTerms.length);

    const order = await rows.evaluateAll((elements) =>
      elements.map((element) => ({
        cssOrder: getComputedStyle(element).order,
        term: element.querySelector("dt")?.textContent?.trim(),
        top: element.getBoundingClientRect().top,
        value: element.querySelector("dd")?.textContent?.trim(),
      })),
    );

    expect(order.map(({ cssOrder }) => cssOrder)).toEqual(["0", "0", "0"]);
    expect(order.map(({ term }) => term)).toEqual([...DATA_PLATE_CONTRACT.longTerms]);
    expect(order.map(({ value }) => value)).toEqual([...DATA_PLATE_CONTRACT.longValues]);
    for (let index = 1; index < order.length; index += 1) {
      expect(order[index].top).toBeGreaterThan(order[index - 1].top);
    }
  });

  test("grows under 200 percent text enlargement instead of truncating", async ({ page }) => {
    await gotoDataPlateFixture(page);
    await page.addStyleTag({
      content: `
        .data-plate,
        .data-plate * {
          font-size: 26px !important;
        }
      `,
    });

    const plate = longPlate(page);
    await expectTextNotTruncated(plate);
    await expectNoHorizontalOverflow(page, plate);
  });

  test("survives WCAG text spacing without overlap, reordering, or truncation", async ({
    page,
  }) => {
    await gotoDataPlateFixture(page);
    await page.addStyleTag({
      content: `
        .data-plate,
        .data-plate * {
          line-height: 1.5 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        }

        .data-plate p {
          margin-block-end: 2em !important;
        }
      `,
    });

    const plate = longPlate(page);
    await expectTextNotTruncated(plate);
    await expectNoHorizontalOverflow(page, plate);

    const boxes = await plate.locator("dt, dd").evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        return { bottom: box.bottom, left: box.left, right: box.right, top: box.top };
      }),
    );

    for (const [index, current] of boxes.entries()) {
      for (const candidate of boxes.slice(index + 1)) {
        const separated =
          current.right <= candidate.left ||
          candidate.right <= current.left ||
          current.bottom <= candidate.top ||
          candidate.bottom <= current.top;
        expect(separated, "Metadata terms and values must not overlap").toBe(true);
      }
    }
  });

  test("retains readable numeric DOM text when custom fonts fail", async ({ page }) => {
    await page.route(/\.(?:woff2?|ttf)(?:\?.*)?$/i, (route) => route.abort());
    await gotoDataPlateFixture(page);

    const plate = longPlate(page);
    await expect(plate.getByText("0007 of 0040", { exact: true })).toBeVisible();
    await expect(plate.getByText(DATA_PLATE_CONTRACT.longValues[0], { exact: true })).toBeVisible();
    await expectTextNotTruncated(plate);
    await expectNoHorizontalOverflow(page, plate);

    const declaredStack = await plate.evaluate((element) => getComputedStyle(element).fontFamily);
    expect(declaredStack.toLowerCase()).toContain("monospace");
  });
});
