import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  ALL_FOOTER_LINKS,
  cssTokenAsColor,
  discoverBuiltRoutes,
  focusFooterLinkWithKeyboard,
  gotoRoute,
  siteFooter,
} from "./support/site-footer";

test.describe("SiteFooter accessibility", () => {
  test("has no WCAG 2.2 A or AA axe violations on any built route", async ({ page }) => {
    const routes = await discoverBuiltRoutes();

    for (const route of routes) {
      await test.step(route, async () => {
        await gotoRoute(page, route);

        const results = await new AxeBuilder({ page })
          .include("footer.site-footer")
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
          .analyze();

        expect(results.violations).toEqual([]);
      });
    }
  });

  test("exposes an intelligible landmark and list hierarchy", async ({ page }) => {
    await gotoRoute(page);
    const footer = siteFooter(page);

    await expect(footer).toHaveCount(1);
    await expect(footer.getByRole("navigation", { name: "Project", exact: true })).toHaveCount(1);
    await expect(footer.getByRole("navigation", { name: "Legal", exact: true })).toHaveCount(1);
    await expect(footer.getByRole("list")).toHaveCount(2);
    await expect(footer.getByRole("listitem")).toHaveCount(ALL_FOOTER_LINKS.length);

    for (const linkContract of ALL_FOOTER_LINKS) {
      await expect(footer.getByRole("link", { name: linkContract.label, exact: true })).toHaveCount(
        1,
      );
    }
  });

  test("traverses links in Project-then-Legal source order and skips plain build data", async ({
    page,
  }) => {
    await gotoRoute(page);
    const footer = siteFooter(page);
    const about = footer.getByRole("link", { name: "About", exact: true });
    await about.focus();

    const observedLabels: string[] = [];
    for (let index = 0; index < ALL_FOOTER_LINKS.length; index += 1) {
      observedLabels.push(
        await page.evaluate(() => document.activeElement?.textContent?.trim() ?? ""),
      );
      await page.keyboard.press("Tab");
    }

    expect(observedLabels).toEqual(ALL_FOOTER_LINKS.map(({ label }) => label));
    await expect(footer.locator("dl.site-footer__build :focus")).toHaveCount(0);
  });

  test("uses the global 2 px accent focus outline with a 2 px offset", async ({ page }) => {
    await gotoRoute(page);
    await focusFooterLinkWithKeyboard(page, "About");

    const link = siteFooter(page).getByRole("link", { name: "About", exact: true });
    const accentColor = await cssTokenAsColor(page, "--accent");
    const focusStyle = await link.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outlineColor: style.outlineColor,
        outlineOffset: style.outlineOffset,
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });

    expect(focusStyle.outlineStyle).not.toBe("none");
    expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(2);
    expect(Number.parseFloat(focusStyle.outlineOffset)).toBeGreaterThanOrEqual(2);
    expect(focusStyle.outlineColor).toBe(accentColor);
  });

  test("preserves underlines and a visible focus indicator in forced colours", async ({
    browserName,
    page,
  }) => {
    test.skip(browserName !== "chromium", "forced-colors emulation is verified in Chromium");

    await page.emulateMedia({ forcedColors: "active" });
    await gotoRoute(page);
    await focusFooterLinkWithKeyboard(page, "About");

    const link = siteFooter(page).getByRole("link", { name: "About", exact: true });
    const style = await link.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        outlineStyle: computed.outlineStyle,
        outlineWidth: computed.outlineWidth,
        textDecorationLine: computed.textDecorationLine,
      };
    });

    expect(style.textDecorationLine).toContain("underline");
    expect(style.outlineStyle).not.toBe("none");
    expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
  });
});
