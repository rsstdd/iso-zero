import { expect, test } from "@playwright/test";
import {
  cssTokenAsColor,
  expectTextNotTruncated,
  gotoIdentityFixture,
  HOMEPAGE_IDENTITY_CONTRACT,
  identity,
  identityByline,
  identityTitle,
} from "./support/homepage-identity";

test.describe("HomepageIdentity output contract", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await gotoIdentityFixture(page);
  });

  test("renders the exact labelled section, heading, byline, and source order", async ({
    page,
  }) => {
    const component = identity(page);

    await expect(component).toHaveCount(1);
    await expect(component).toHaveAttribute(
      "aria-labelledby",
      HOMEPAGE_IDENTITY_CONTRACT.headingId,
    );
    await expect(component).not.toHaveAttribute("role");
    await expect(component.locator(":scope > *")).toHaveCount(2);

    const directChildren = await component.locator(":scope > *").evaluateAll((elements) =>
      elements.map((element) => ({
        id: element.id || null,
        tag: element.tagName,
        text: element.textContent?.trim(),
      })),
    );
    expect(directChildren).toEqual([
      {
        id: HOMEPAGE_IDENTITY_CONTRACT.headingId,
        tag: "H1",
        text: HOMEPAGE_IDENTITY_CONTRACT.title,
      },
      { id: null, tag: "P", text: HOMEPAGE_IDENTITY_CONTRACT.byline },
    ]);
  });

  test("owns the page's only h1 and precedes both required h2 headings", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2 })).toHaveText([
      ...HOMEPAGE_IDENTITY_CONTRACT.followingHeadings,
    ]);

    const headingSequence = await page.locator("main h1, main h2").evaluateAll((headings) =>
      headings.map((heading) => ({
        level: Number(heading.tagName.slice(1)),
        text: heading.textContent?.trim(),
      })),
    );
    expect(headingSequence).toEqual([
      { level: 1, text: HOMEPAGE_IDENTITY_CONTRACT.title },
      { level: 2, text: HOMEPAGE_IDENTITY_CONTRACT.followingHeadings[0] },
      { level: 2, text: HOMEPAGE_IDENTITY_CONTRACT.followingHeadings[1] },
    ]);

    const precedesFeatured = await identity(page).evaluate((element) => {
      const featured = document.querySelector('[data-fixture="featured-gallery"]');
      return featured
        ? Boolean(element.compareDocumentPosition(featured) & Node.DOCUMENT_POSITION_FOLLOWING)
        : false;
    });
    expect(precedesFeatured).toBe(true);
  });

  test("adds no prose, action, image, metadata, route data, or interactive element", async ({
    page,
  }) => {
    const component = identity(page);

    await expect(component.locator(":scope > *")).toHaveText([
      HOMEPAGE_IDENTITY_CONTRACT.title,
      HOMEPAGE_IDENTITY_CONTRACT.byline,
    ]);
    await expect(
      component.locator(
        "a, button, input, select, textarea, summary, img, picture, svg, nav, dl, time, [tabindex], [contenteditable]",
      ),
    ).toHaveCount(0);
  });

  test("emits no script, inline handler, generated copy, or focus stop", async ({ page }) => {
    const component = identity(page);

    await expect(page.locator("script")).toHaveCount(0);
    const forbiddenAttributes = await component.evaluate((element) =>
      [element, ...element.querySelectorAll("*")].flatMap((candidate) =>
        Array.from(candidate.attributes)
          .map((attribute) => attribute.name)
          .filter((attributeName) => /^on/i.test(attributeName)),
      ),
    );
    expect(forbiddenAttributes).toEqual([]);

    const generatedContent = await component.evaluate((element) =>
      [element, ...element.querySelectorAll("*")].flatMap((candidate) =>
        ["::before", "::after"].map((pseudo) => getComputedStyle(candidate, pseudo).content),
      ),
    );
    expect(generatedContent.every((content) => content === "none" || content === "normal")).toBe(
      true,
    );
    expect(await component.evaluate((element) => (element as HTMLElement).tabIndex)).toBe(-1);
  });
});

test.describe("HomepageIdentity Datum rendering", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await gotoIdentityFixture(page);
  });

  test("uses Serif display type for the title and Sans muted type for the byline", async ({
    page,
  }) => {
    const [textColor, mutedColor] = await Promise.all([
      cssTokenAsColor(page, "--text"),
      cssTokenAsColor(page, "--text-muted"),
    ]);
    const titleStyle = await identityTitle(page).evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.color,
        fontFamily: style.fontFamily,
        fontSize: Number.parseFloat(style.fontSize),
        fontWeight: style.fontWeight,
        lineHeight: Number.parseFloat(style.lineHeight),
        textTransform: style.textTransform,
      };
    });
    const bylineStyle = await identityByline(page).evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.color,
        fontFamily: style.fontFamily,
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        textTransform: style.textTransform,
      };
    });

    expect(titleStyle.fontFamily).toContain("IBM Plex Serif");
    expect(titleStyle.fontWeight).toBe("400");
    expect(titleStyle.color).toBe(textColor);
    expect(titleStyle.textTransform).toBe("none");
    expect(titleStyle.lineHeight).toBeGreaterThan(titleStyle.fontSize);

    expect(bylineStyle.fontFamily).toContain("IBM Plex Sans");
    expect(bylineStyle.color).toBe(mutedColor);
    expect(bylineStyle.textTransform).toBe("none");
    expect(bylineStyle.lineHeight).toBeGreaterThan(bylineStyle.fontSize);
    expect(titleStyle.fontSize).toBeGreaterThan(bylineStyle.fontSize);
  });

  test("uses the wide-container origin and deliberate separation from adjacent content", async ({
    page,
  }) => {
    const measurements = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>('[data-fixture="header"]');
      const component = document.querySelector<HTMLElement>(".homepage-identity");
      const title = component?.querySelector<HTMLElement>("h1");
      const byline = component?.querySelector<HTMLElement>("p");
      const hero = document.querySelector<HTMLElement>('[data-fixture="hero-origin"]');
      const featured = document.querySelector<HTMLElement>('[data-fixture="featured-gallery"]');
      if (!header || !component || !title || !byline || !hero || !featured) return null;

      return {
        bylineBottom: byline.getBoundingClientRect().bottom,
        componentLeft: component.getBoundingClientRect().left,
        componentRight: component.getBoundingClientRect().right,
        featuredTop: featured.getBoundingClientRect().top,
        headerBottom: header.getBoundingClientRect().bottom,
        heroLeft: hero.getBoundingClientRect().left,
        heroRight: hero.getBoundingClientRect().right,
        titleTop: title.getBoundingClientRect().top,
      };
    });

    expect(measurements).not.toBeNull();
    expect(measurements?.componentLeft).toBeCloseTo(measurements?.heroLeft ?? 0, 0);
    expect(measurements?.componentRight).toBeCloseTo(measurements?.heroRight ?? 0, 0);
    expect(
      (measurements?.titleTop ?? 0) - (measurements?.headerBottom ?? 0),
    ).toBeGreaterThanOrEqual(8);
    expect(
      (measurements?.featuredTop ?? 0) - (measurements?.bylineBottom ?? 0),
    ).toBeGreaterThanOrEqual(8);
  });

  test("has no rule, tick, panel, border, radius, shadow, background, or accent decoration", async ({
    page,
  }) => {
    const accentColor = await cssTokenAsColor(page, "--accent");
    const styles = await identity(page).evaluate((element) =>
      [element, ...element.querySelectorAll("*")].map((candidate) => {
        const style = getComputedStyle(candidate);
        return {
          backgroundColor: style.backgroundColor,
          borderBottomWidth: style.borderBottomWidth,
          borderLeftWidth: style.borderLeftWidth,
          borderRadius: style.borderRadius,
          borderRightWidth: style.borderRightWidth,
          borderTopWidth: style.borderTopWidth,
          boxShadow: style.boxShadow,
          color: style.color,
        };
      }),
    );

    for (const style of styles) {
      expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
      expect(style.borderBottomWidth).toBe("0px");
      expect(style.borderLeftWidth).toBe("0px");
      expect(style.borderRightWidth).toBe("0px");
      expect(style.borderTopWidth).toBe("0px");
      expect(style.borderRadius).toBe("0px");
      expect(style.boxShadow).toBe("none");
      expect(style.color).not.toBe(accentColor);
    }

    await expectTextNotTruncated(identity(page));
  });
});
