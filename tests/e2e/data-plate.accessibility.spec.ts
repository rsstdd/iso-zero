import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  allDataPlates,
  DATA_PLATE_CONTRACT,
  defaultPlate,
  figurePlate,
  footerPlate,
  gotoDataPlateFixture,
} from "./support/data-plate";

test.describe("DataPlate accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await gotoDataPlateFixture(page);
  });

  test("has no WCAG 2.2 A or AA axe violations in the complete fixture", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("exposes native definition relationships without redundant roles", async ({ page }) => {
    const plate = defaultPlate(page);

    await expect(plate.getByRole("term")).toHaveText([...DATA_PLATE_CONTRACT.defaultTerms]);
    await expect(plate.getByRole("definition")).toHaveText([...DATA_PLATE_CONTRACT.defaultValues]);
    await expect(allDataPlates(page).locator("[role]")).toHaveCount(0);
    const roles = await allDataPlates(page).evaluateAll((plates) =>
      plates.map((plate) => plate.getAttribute("role")),
    );
    expect(roles).toEqual([null, null, null, null]);
  });

  test("keeps figcaption and section-footer semantics in valid native contexts", async ({
    page,
  }) => {
    const figure = page.locator('figure[data-fixture="figcaption"]');
    const section = page.locator('section[data-fixture="footer"]');

    await expect(figure.locator(":scope > figcaption.data-plate")).toHaveCount(1);
    const lastChildTag = await figure.evaluate((element) => element.lastElementChild?.tagName);
    expect(lastChildTag).toBe("FIGCAPTION");
    await expect(section.locator(":scope > footer.data-plate")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
    await expect(figurePlate(page)).not.toHaveAttribute("aria-labelledby");
    await expect(footerPlate(page)).toHaveAttribute("aria-labelledby", "section-footer-heading");
  });

  test("does not add keyboard focus stops to non-interactive metadata", async ({ page }) => {
    const focusableSelector =
      'a[href], button, input, select, textarea, summary, [contenteditable="true"], ' +
      '[tabindex]:not([tabindex="-1"])';

    await expect(allDataPlates(page).locator(focusableSelector)).toHaveCount(0);
    const tabIndexes = await allDataPlates(page).evaluateAll((plates) =>
      plates.map((plate) => (plate as HTMLElement).tabIndex),
    );
    expect(tabIndexes).toEqual([-1, -1, -1, -1]);
  });

  test("preserves meaning when forced colours suppress the decorative boundary", async ({
    browserName,
    page,
  }) => {
    test.skip(browserName !== "chromium", "forced-colors emulation is verified in Chromium");

    await page.emulateMedia({ forcedColors: "active" });
    await gotoDataPlateFixture(page);
    await page.addStyleTag({ content: ".data-plate { border-block-start: 0 !important; }" });

    await expect(defaultPlate(page).getByRole("term")).toHaveText([
      ...DATA_PLATE_CONTRACT.defaultTerms,
    ]);
    await expect(defaultPlate(page).getByRole("definition")).toHaveText([
      ...DATA_PLATE_CONTRACT.defaultValues,
    ]);
    await expect(figurePlate(page)).toContainText("Venice, Italy");
    await expect(footerPlate(page)).toContainText("0a1b2c3");

    const results = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
