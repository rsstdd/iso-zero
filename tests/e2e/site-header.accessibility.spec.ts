import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  ALL_HEADER_LINKS,
  cssTokenAsColor,
  discoverBuiltRoutes,
  focusHeaderLinkWithKeyboard,
  galleriesLink,
  gotoRoute,
  HEADER_CONTRACT,
  nonColourLinkState,
  siteHeader,
  wordmark,
} from "./support/site-header";

test.describe("SiteHeader accessibility", () => {
  test("has no WCAG 2.2 A or AA axe violations on any built route", async ({ page }) => {
    const routes = await discoverBuiltRoutes();

    for (const route of routes) {
      await test.step(route, async () => {
        await gotoRoute(page, route);

        const results = await new AxeBuilder({ page })
          .include("header.site-header")
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
          .analyze();

        expect(results.violations).toEqual([]);
      });
    }
  });

  test("exposes one Header landmark and one named list-based navigation", async ({ page }) => {
    await gotoRoute(page);
    const header = siteHeader(page);
    const navigation = header.getByRole("navigation", {
      name: HEADER_CONTRACT.primaryNavigationLabel,
      exact: true,
    });

    await expect(header).toHaveCount(1);
    await expect(navigation).toHaveCount(1);
    await expect(navigation.getByRole("list")).toHaveCount(1);
    await expect(navigation.getByRole("listitem")).toHaveCount(1);
    await expect(header.getByRole("link")).toHaveCount(ALL_HEADER_LINKS.length);
    await expect(wordmark(page)).toHaveAccessibleName(HEADER_CONTRACT.wordmark.label);
    await expect(galleriesLink(page)).toHaveAccessibleName(HEADER_CONTRACT.primaryLinks[0].label);
  });

  test("traverses wordmark then Galleries in source order", async ({ page }) => {
    await gotoRoute(page, "/about/");
    await wordmark(page).focus();

    const observedLabels: string[] = [];
    for (let index = 0; index < ALL_HEADER_LINKS.length; index += 1) {
      observedLabels.push(
        await page.evaluate(() => document.activeElement?.textContent?.trim() ?? ""),
      );
      await page.keyboard.press("Tab");
    }

    expect(observedLabels).toEqual(ALL_HEADER_LINKS.map(({ label }) => label));
  });

  test("uses the global 2 px accent focus outline with a 2 px offset", async ({ page }) => {
    await gotoRoute(page);
    await focusHeaderLinkWithKeyboard(page, "ISO Null");

    const link = wordmark(page);
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

    const clippingAncestors = await link.evaluate((element) => {
      const values: string[] = [];
      let ancestor = element.parentElement;
      while (ancestor) {
        values.push(getComputedStyle(ancestor).overflow);
        if (ancestor.matches("header.site-header")) break;
        ancestor = ancestor.parentElement;
      }
      return values;
    });
    expect(clippingAncestors).not.toContain("hidden");
    expect(clippingAncestors).not.toContain("clip");
  });

  test("preserves current state, underlines, and focus in forced colours", async ({
    browserName,
    page,
  }) => {
    test.skip(browserName !== "chromium", "forced-colors emulation is verified in Chromium");

    await page.emulateMedia({ forcedColors: "active" });
    await gotoRoute(page, "/about/");
    const inactiveState = await nonColourLinkState(galleriesLink(page));

    await gotoRoute(page, "/galleries/");
    const currentState = await nonColourLinkState(galleriesLink(page));
    await focusHeaderLinkWithKeyboard(page, "Galleries");

    const style = await galleriesLink(page).evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        outlineStyle: computed.outlineStyle,
        outlineWidth: computed.outlineWidth,
        textDecorationLine: computed.textDecorationLine,
      };
    });

    expect(currentState).not.toEqual(inactiveState);
    expect(style.textDecorationLine).toContain("underline");
    expect(style.outlineStyle).not.toBe("none");
    expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
  });
});
