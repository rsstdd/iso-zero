import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  contrastRatio,
  cssTokenAsColor,
  gotoIdentityFixture,
  HOMEPAGE_IDENTITY_CONTRACT,
  identity,
  identityByline,
  identityTitle,
} from "./support/homepage-identity";

test.describe("HomepageIdentity accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await gotoIdentityFixture(page);
  });

  test("has no WCAG 2.2 A or AA axe violations in the complete fixture", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("exposes a section named by its visible h1 without an explicit role", async ({ page }) => {
    const component = identity(page);

    await expect(
      page.getByRole("region", { name: HOMEPAGE_IDENTITY_CONTRACT.title, exact: true }),
    ).toHaveCount(1);
    await expect(component).toHaveAttribute(
      "aria-labelledby",
      HOMEPAGE_IDENTITY_CONTRACT.headingId,
    );
    await expect(component).not.toHaveAttribute("role");
    await expect(identityTitle(page)).toHaveAttribute("id", HOMEPAGE_IDENTITY_CONTRACT.headingId);
  });

  test("keeps the identity non-interactive and outside the keyboard focus order", async ({
    page,
  }) => {
    const component = identity(page);
    const focusableSelector =
      'a[href], button, input, select, textarea, summary, [contenteditable="true"], ' +
      '[tabindex]:not([tabindex="-1"])';

    await expect(component.locator(focusableSelector)).toHaveCount(0);
    expect(await component.evaluate((element) => (element as HTMLElement).tabIndex)).toBe(-1);
    expect(await identityTitle(page).evaluate((element) => (element as HTMLElement).tabIndex)).toBe(
      -1,
    );
    expect(
      await identityByline(page).evaluate((element) => (element as HTMLElement).tabIndex),
    ).toBe(-1);
  });

  test("meets text contrast for the title and secondary byline treatment", async ({ page }) => {
    const [background, titleColor, bylineColor] = await Promise.all([
      cssTokenAsColor(page, "--bg"),
      identityTitle(page).evaluate((element) => getComputedStyle(element).color),
      identityByline(page).evaluate((element) => getComputedStyle(element).color),
    ]);

    expect(contrastRatio(titleColor, background)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(bylineColor, background)).toBeGreaterThanOrEqual(4.5);
  });

  test("preserves content, naming, and hierarchy in forced colours", async ({
    browserName,
    page,
  }) => {
    test.skip(browserName !== "chromium", "forced-colors emulation is verified in Chromium");

    await page.emulateMedia({ forcedColors: "active" });
    await gotoIdentityFixture(page);

    await expect(identityTitle(page)).toBeVisible();
    await expect(identityByline(page)).toBeVisible();
    await expect(identityTitle(page)).toHaveText(HOMEPAGE_IDENTITY_CONTRACT.title);
    await expect(identityByline(page)).toHaveText(HOMEPAGE_IDENTITY_CONTRACT.byline);
    await expect(
      page.getByRole("region", { name: HOMEPAGE_IDENTITY_CONTRACT.title, exact: true }),
    ).toHaveCount(1);

    const results = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
