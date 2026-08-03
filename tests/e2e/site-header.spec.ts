import { expect, test } from "@playwright/test";
import {
  ALL_HEADER_LINKS,
  cssTokenAsColor,
  discoverBuiltRoutes,
  expectedCurrentState,
  expectLinkTargetAtLeast,
  expectNoHorizontalOverflow,
  galleriesLink,
  gotoRoute,
  HEADER_CONTRACT,
  nonColourLinkState,
  siteHeader,
  wordmark,
} from "./support/site-header";

test.describe("SiteHeader contract", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await gotoRoute(page);
  });

  test("renders the exact site identity and one-item primary navigation", async ({ page }) => {
    const header = siteHeader(page);
    const navigation = header.getByRole("navigation", {
      name: HEADER_CONTRACT.primaryNavigationLabel,
      exact: true,
    });

    await expect(header).toHaveCount(1);
    await expect(header.locator(":scope > *")).toHaveCount(2);
    await expect(header.locator(":scope > a.site-wordmark")).toHaveCount(1);
    await expect(header.locator(":scope > nav")).toHaveCount(1);
    await expect(wordmark(page)).toHaveText(HEADER_CONTRACT.wordmark.label);
    await expect(wordmark(page)).toHaveAttribute("href", HEADER_CONTRACT.wordmark.href);
    await expect(navigation).toHaveCount(1);
    await expect(navigation.locator(":scope > ul")).toHaveCount(1);
    await expect(navigation.getByRole("list")).toHaveCount(1);
    await expect(navigation.getByRole("listitem")).toHaveCount(1);
    await expect(navigation.getByRole("link")).toHaveCount(1);
    await expect(galleriesLink(page)).toHaveText(HEADER_CONTRACT.primaryLinks[0].label);
    await expect(galleriesLink(page)).toHaveAttribute("href", HEADER_CONTRACT.primaryLinks[0].href);
    await expect(header.getByRole("link")).toHaveCount(ALL_HEADER_LINKS.length);

    const accessibleOverrides = await header
      .getByRole("link")
      .evaluateAll((links) => links.map((link) => link.getAttribute("aria-label")));
    expect(accessibleOverrides).toEqual([null, null]);
  });

  test("applies the complete aria-current route matrix to every built route", async ({ page }) => {
    const routes = await discoverBuiltRoutes();
    const galleryDetailRoutes = routes.filter((route) => /^\/galleries\/[^/]+\/$/.test(route));

    expect(routes).toContain("/");
    expect(routes).toContain("/galleries/");
    expect(
      galleryDetailRoutes.length,
      "The launch build must contain at least one gallery detail route",
    ).toBeGreaterThan(0);

    for (const route of routes) {
      await test.step(route, async () => {
        await gotoRoute(page, route);
        const expected = expectedCurrentState(route);

        if (expected.wordmark) {
          await expect(wordmark(page)).toHaveAttribute("aria-current", expected.wordmark);
        } else {
          await expect(wordmark(page)).not.toHaveAttribute("aria-current");
        }

        if (expected.galleries) {
          await expect(galleriesLink(page)).toHaveAttribute("aria-current", expected.galleries);
        } else {
          await expect(galleriesLink(page)).not.toHaveAttribute("aria-current");
        }

        const currentLinks = siteHeader(page).locator("a[aria-current]");
        await expect(currentLinks).toHaveCount(expected.wordmark || expected.galleries ? 1 : 0);
      });
    }
  });

  test("keeps labels and destinations consistent on every built route", async ({ page }) => {
    const routes = await discoverBuiltRoutes();

    for (const route of routes) {
      await test.step(route, async () => {
        await gotoRoute(page, route);
        const header = siteHeader(page);

        await expect(header).toHaveCount(1);
        await expect(header.getByRole("link")).toHaveCount(ALL_HEADER_LINKS.length);
        for (const linkContract of ALL_HEADER_LINKS) {
          const link = header.getByRole("link", { name: linkContract.label, exact: true });
          await expect(link).toHaveAttribute("href", linkContract.href);
        }
      });
    }
  });

  test("contains only same-origin route literals and both destinations resolve", async ({
    page,
  }) => {
    for (const linkContract of ALL_HEADER_LINKS) {
      const link = siteHeader(page).getByRole("link", {
        name: linkContract.label,
        exact: true,
      });
      const href = await link.getAttribute("href");
      expect(href).toBe(linkContract.href);
      expect(href?.startsWith("/")).toBe(true);

      const response = await page.request.get(linkContract.href);
      expect(response.status(), `${linkContract.href} must resolve`).toBeLessThan(400);
    }
  });

  test("activates links with Enter and reaches the declared routes", async ({ page }) => {
    await gotoRoute(page, "/galleries/");
    await wordmark(page).focus();
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/"),
      page.keyboard.press("Enter"),
    ]);

    await galleriesLink(page).focus();
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/galleries/"),
      page.keyboard.press("Enter"),
    ]);
  });

  test("excludes non-primary destinations, controls, imagery, forms, and client behavior", async ({
    page,
  }) => {
    const header = siteHeader(page);

    for (const label of HEADER_CONTRACT.forbiddenLabels) {
      await expect(header.getByText(label, { exact: true })).toHaveCount(0);
    }

    await expect(
      header.locator(
        "script, form, img, picture, svg, iframe, button, input, select, textarea, dialog",
      ),
    ).toHaveCount(0);
    await expect(header.locator("[aria-haspopup], [aria-expanded], [popovertarget]")).toHaveCount(
      0,
    );

    const forbiddenAttributes = await header.evaluate((element) =>
      Array.from(element.querySelectorAll("*")).flatMap((descendant) =>
        Array.from(descendant.attributes)
          .map((attribute) => attribute.name)
          .filter((attributeName) => /^on/i.test(attributeName)),
      ),
    );
    expect(forbiddenAttributes).toEqual([]);
  });
});

test.describe("SiteHeader Datum rendering", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await gotoRoute(page, "/about/");
  });

  test("uses the decorative Datum divider without panel treatment", async ({ page }) => {
    const header = siteHeader(page);
    const borderColor = await cssTokenAsColor(page, "--border-c");
    const style = await header.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        backgroundColor: computed.backgroundColor,
        borderBlockEndColor: computed.borderBlockEndColor,
        borderBlockEndWidth: computed.borderBlockEndWidth,
        borderRadius: computed.borderRadius,
        boxShadow: computed.boxShadow,
        position: computed.position,
      };
    });

    expect(style.borderBlockEndWidth).toBe("1px");
    expect(style.borderBlockEndColor).toBe(borderColor);
    expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(style.borderRadius).toBe("0px");
    expect(style.boxShadow).toBe("none");
    expect(["fixed", "sticky"]).not.toContain(style.position);
  });

  test("uses Serif for the wordmark and Sans for primary navigation", async ({ page }) => {
    const textColor = await cssTokenAsColor(page, "--text");
    const wordmarkStyle = await wordmark(page).evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.color,
        fontFamily: style.fontFamily,
        textTransform: style.textTransform,
      };
    });
    const navigationStyle = await galleriesLink(page).evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.color,
        fontFamily: style.fontFamily,
        textDecorationLine: style.textDecorationLine,
        textTransform: style.textTransform,
      };
    });

    expect(wordmarkStyle.fontFamily).toContain("IBM Plex Serif");
    expect(wordmarkStyle.color).toBe(textColor);
    expect(wordmarkStyle.textTransform).toBe("none");
    expect(navigationStyle.fontFamily).toContain("IBM Plex Sans");
    expect(navigationStyle.color).toBe(textColor);
    expect(navigationStyle.textTransform).toBe("none");
    expect(navigationStyle.textDecorationLine).toContain("underline");
  });

  test("does not use International Orange as a Header decoration", async ({ page }) => {
    const accentColor = await cssTokenAsColor(page, "--accent");
    for (const route of ["/about/", "/galleries/"]) {
      await gotoRoute(page, route);
      const accentDecorations = await siteHeader(page).evaluate((header, accent) => {
        const matches = new Set<string>();
        const elements = [header, ...header.querySelectorAll("*")];

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

      expect(accentDecorations, `${route} must reserve accent for focus`).toEqual([]);
    }
  });

  test("distinguishes the current Galleries route without relying on colour", async ({ page }) => {
    await page.addStyleTag({
      content: `
        header.site-header,
        header.site-header * {
          color: CanvasText !important;
        }
      `,
    });
    const inactiveState = await nonColourLinkState(galleriesLink(page));

    await gotoRoute(page, "/galleries/");
    await page.addStyleTag({
      content: `
        header.site-header,
        header.site-header * {
          color: CanvasText !important;
        }
      `,
    });
    const currentState = await nonColourLinkState(galleriesLink(page));

    expect(currentState).not.toEqual(inactiveState);
    expect(
      currentState.decorationLine.includes("underline") || currentState.fontWeight !== "400",
    ).toBe(true);
  });

  test("strengthens the underline on hover without moving the link", async ({ page }) => {
    const link = galleriesLink(page);
    const beforeBox = await link.boundingBox();
    const beforeState = await nonColourLinkState(link);

    await link.hover();

    await expect
      .poll(async () => {
        const state = await nonColourLinkState(link);
        return (
          state.decorationThickness !== beforeState.decorationThickness ||
          state.underlineOffset !== beforeState.underlineOffset
        );
      })
      .toBe(true);

    const afterBox = await link.boundingBox();
    const afterState = await nonColourLinkState(link);

    expect(afterBox).toEqual(beforeBox);
    expect(afterState.decorationLine).toContain("underline");
    expect(
      afterState.decorationThickness !== beforeState.decorationThickness ||
        afterState.underlineOffset !== beforeState.underlineOffset,
      "Hover must strengthen the underline through thickness or offset",
    ).toBe(true);
  });

  test("meets target size and overflow requirements at a wide viewport", async ({ page }) => {
    for (const link of await siteHeader(page).getByRole("link").all()) {
      await expectLinkTargetAtLeast(link);
    }
    await expectNoHorizontalOverflow(page);
  });
});
