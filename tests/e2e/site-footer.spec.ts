import { expect, test } from "@playwright/test";
import {
  ALL_FOOTER_LINKS,
  cssTokenAsColor,
  discoverBuiltRoutes,
  expectLinkTargetAtLeast,
  expectNoHorizontalOverflow,
  FOOTER_CONTRACT,
  footerOuterHtml,
  gotoRoute,
  siteFooter,
} from "./support/site-footer";

test.describe("SiteFooter contract", () => {
  test.beforeEach(async ({ page }) => {
    await gotoRoute(page);
  });

  test("renders one footer with two uniquely named navigation landmarks", async ({ page }) => {
    const footer = siteFooter(page);
    await expect(footer).toHaveCount(1);
    await expect(footer.locator(":scope > .site-footer__inner > *")).toHaveCount(3);

    const projectNavigation = footer.getByRole("navigation", {
      name: "Project",
      exact: true,
    });
    const legalNavigation = footer.getByRole("navigation", {
      name: "Legal",
      exact: true,
    });

    await expect(projectNavigation).toHaveCount(1);
    await expect(legalNavigation).toHaveCount(1);
    await expect(footer.getByRole("navigation")).toHaveCount(2);
  });

  test("renders the exact project and legal link contracts as semantic lists", async ({ page }) => {
    const footer = siteFooter(page);

    for (const [navigationName, links] of [
      ["Project", FOOTER_CONTRACT.projectLinks],
      ["Legal", FOOTER_CONTRACT.legalLinks],
    ] as const) {
      const navigation = footer.getByRole("navigation", {
        name: navigationName,
        exact: true,
      });
      const list = navigation.locator(":scope > ul");

      await expect(navigation.locator(":scope > *")).toHaveCount(1);
      await expect(list).toHaveCount(1);
      await expect(list.locator(":scope > li")).toHaveCount(links.length);
      await expect(list.locator(":scope > li > a")).toHaveCount(links.length);

      for (const linkContract of links) {
        await expect(
          navigation.getByRole("link", { name: linkContract.label, exact: true }),
        ).toHaveAttribute("href", linkContract.href);
      }
    }
  });

  test("renders ownership and deterministic build identity as label-value data", async ({
    page,
  }) => {
    const footer = siteFooter(page);
    const dataPlate = footer.locator(".data-plate");
    const buildData = footer.locator("dl.site-footer__build");
    const copyright = dataPlate.locator(":scope > p");

    await expect(dataPlate).toHaveCount(1);
    await expect(dataPlate.locator(":scope > *")).toHaveCount(2);
    await expect(copyright).toHaveCount(1);
    await expect(copyright).toHaveText(/^© \d{4} Ross Todd\. All rights reserved\.$/);
    await expect(buildData).toHaveCount(1);
    await expect(buildData.locator(":scope > div")).toHaveCount(2);
    await expect(buildData.locator("dt")).toHaveText([...FOOTER_CONTRACT.buildTerms]);
    await expect(buildData.locator("dd").nth(0)).toHaveText(/^[0-9a-f]{7}$/);
    await expect(buildData.locator("dd").nth(1)).toHaveText(/\S+/);
    await expect(buildData.getByRole("link")).toHaveCount(0);
    await expect(buildData.locator("button, input, select, textarea")).toHaveCount(0);
    await expect(footer.locator("time, [datetime]")).toHaveCount(0);
  });

  test("publishes the full build identity in document metadata", async ({ page }) => {
    const buildValues = siteFooter(page).locator("dl.site-footer__build dd");
    const abbreviatedSha = (await buildValues.nth(0).textContent())?.trim() ?? "";
    const contentVersion = (await buildValues.nth(1).textContent())?.trim() ?? "";
    const metaValues = await page
      .locator("head meta[content]")
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("content")?.trim() ?? ""),
      );

    expect(abbreviatedSha).toMatch(/^[0-9a-f]{7}$/);
    expect(contentVersion).toMatch(/\S+/);
    expect(
      metaValues.some(
        (value) => /^[0-9a-f]{8,}$/.test(value) && value.toLowerCase().startsWith(abbreviatedSha),
      ),
      "A meta value must expose the supplied full commit SHA",
    ).toBe(true);
    expect(metaValues).toContain(contentVersion);
  });

  test("contains only same-origin literals and every required destination resolves", async ({
    page,
  }) => {
    const footer = siteFooter(page);
    await expect(footer.getByRole("link")).toHaveCount(ALL_FOOTER_LINKS.length);

    for (const linkContract of ALL_FOOTER_LINKS) {
      const link = footer.getByRole("link", { name: linkContract.label, exact: true });
      const href = await link.getAttribute("href");
      expect(href).toBe(linkContract.href);
      expect(href?.startsWith("/")).toBe(true);

      const response = await page.request.get(linkContract.href);
      expect(response.status(), `${linkContract.href} must resolve`).toBeLessThan(400);
    }
  });

  test("excludes primary navigation, commerce, social, forms, tracking, and scripts", async ({
    page,
  }) => {
    const footer = siteFooter(page);

    await expect(footer.getByText("Galleries", { exact: true })).toHaveCount(0);
    await expect(footer.getByText("Shop", { exact: true })).toHaveCount(0);
    await expect(
      footer.locator(
        "script, form, img, iframe, button, input, select, textarea, [href^='mailto:']",
      ),
    ).toHaveCount(0);

    const forbiddenAttributes = await footer.evaluate((element) =>
      Array.from(element.querySelectorAll("*")).flatMap((descendant) =>
        Array.from(descendant.attributes)
          .map((attribute) => attribute.name)
          .filter((attributeName) => /^on/i.test(attributeName)),
      ),
    );
    expect(forbiddenAttributes).toEqual([]);
  });

  test("renders byte-identical footer markup on every built route", async ({ page }) => {
    const routes = await discoverBuiltRoutes();
    let referenceMarkup: string | undefined;

    for (const route of routes) {
      await test.step(route, async () => {
        await gotoRoute(page, route);
        await expect(siteFooter(page)).toHaveCount(1);

        const markup = await footerOuterHtml(page);
        referenceMarkup ??= markup;
        expect(markup).toBe(referenceMarkup);
      });
    }
  });
});

test.describe("SiteFooter Datum rendering", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await gotoRoute(page);
  });

  test("uses the decorative Datum boundary without panel treatment", async ({ page }) => {
    const footer = siteFooter(page);
    const dataPlate = footer.locator(".data-plate");
    const borderColor = await cssTokenAsColor(page, "--border-c");

    const footerStyle = await footer.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        borderBlockStartColor: style.borderBlockStartColor,
        borderBlockStartWidth: style.borderBlockStartWidth,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
      };
    });

    expect(footerStyle.borderBlockStartWidth).toBe("1px");
    expect(footerStyle.borderBlockStartColor).toBe(borderColor);
    expect(footerStyle.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(footerStyle.borderRadius).toBe("0px");
    expect(footerStyle.boxShadow).toBe("none");

    const plateStyle = await dataPlate.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        borderBlockStartColor: style.borderBlockStartColor,
        borderBlockStartWidth: style.borderBlockStartWidth,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
      };
    });

    expect(plateStyle.borderBlockStartWidth).toBe("1px");
    expect(plateStyle.borderBlockStartColor).toBe(borderColor);
    expect(plateStyle.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(plateStyle.borderRadius).toBe("0px");
    expect(plateStyle.boxShadow).toBe("none");

    const accentColor = await cssTokenAsColor(page, "--accent");
    const accentDecorations = await footer.locator("*").evaluateAll((elements, accent) => {
      const matches = new Set<string>();

      for (const element of elements) {
        for (const pseudo of [null, "::before", "::after"] as const) {
          const style = getComputedStyle(element, pseudo);
          const colours = [
            style.backgroundColor,
            style.borderBlockEndColor,
            style.borderBlockStartColor,
            style.borderInlineEndColor,
            style.borderInlineStartColor,
            style.color,
          ];
          if (colours.includes(accent)) {
            matches.add(`${element.tagName.toLowerCase()}${pseudo ?? ""}`);
          }
        }
      }

      return [...matches];
    }, accentColor);
    expect(accentDecorations).toEqual([]);
  });

  test("uses Sans for links and Mono for ownership and build data", async ({ page }) => {
    const footer = siteFooter(page);
    const link = footer.getByRole("link", { name: "About", exact: true });
    const dataPlate = footer.locator(".data-plate");
    const mutedColor = await cssTokenAsColor(page, "--text-muted");

    const linkStyle = await link.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        fontFamily: style.fontFamily,
        textDecorationLine: style.textDecorationLine,
      };
    });
    expect(linkStyle.fontFamily).toContain("IBM Plex Sans");
    expect(linkStyle.textDecorationLine).toContain("underline");

    const linkDecorations = await footer
      .getByRole("link")
      .evaluateAll((links) =>
        links.map((candidate) => getComputedStyle(candidate).textDecorationLine),
      );
    expect(linkDecorations.every((decoration) => decoration.includes("underline"))).toBe(true);

    const dataStyle = await dataPlate.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.color,
        fontFamily: style.fontFamily,
        fontFeatureSettings: style.fontFeatureSettings,
        fontSize: style.fontSize,
        fontVariantNumeric: style.fontVariantNumeric,
      };
    });
    expect(dataStyle.fontFamily).toContain("IBM Plex Mono");
    expect(dataStyle.fontSize).toBe("13px");
    expect(dataStyle.color).toBe(mutedColor);
    expect(dataStyle.fontVariantNumeric).toContain("tabular-nums");
    expect(dataStyle.fontFeatureSettings).toContain("zero");
  });

  test("keeps hover feedback underlined and layout-stable", async ({ page }) => {
    const link = siteFooter(page).getByRole("link", { name: "About", exact: true });
    const beforeBox = await link.boundingBox();
    const beforeScrollY = await page.evaluate(() => window.scrollY);
    const beforeStyle = await link.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        offset: style.textUnderlineOffset,
        thickness: style.textDecorationThickness,
      };
    });

    await link.hover();

    const afterBox = await link.boundingBox();
    const afterScrollY = await page.evaluate(() => window.scrollY);
    const afterStyle = await link.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        decoration: style.textDecorationLine,
        offset: style.textUnderlineOffset,
        thickness: style.textDecorationThickness,
      };
    });

    expect(afterBox).not.toBeNull();
    expect(beforeBox).not.toBeNull();
    expect({
      height: afterBox?.height,
      width: afterBox?.width,
      x: afterBox?.x,
      documentY: (afterBox?.y ?? 0) + afterScrollY,
    }).toEqual({
      height: beforeBox?.height,
      width: beforeBox?.width,
      x: beforeBox?.x,
      documentY: (beforeBox?.y ?? 0) + beforeScrollY,
    });
    expect(afterStyle.decoration).toContain("underline");
    expect(
      afterStyle.offset !== beforeStyle.offset || afterStyle.thickness !== beforeStyle.thickness,
      "Hover must strengthen the underline through thickness or offset",
    ).toBe(true);
  });

  test("meets target size and overflow requirements at a wide viewport", async ({ page }) => {
    for (const link of await siteFooter(page).getByRole("link").all()) {
      await expectLinkTargetAtLeast(link);
    }
    await expectNoHorizontalOverflow(page);
  });
});
