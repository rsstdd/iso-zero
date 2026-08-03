import { expect, test } from "@playwright/test";
import {
  allDataPlates,
  contrastRatio,
  cssTokenAsColor,
  DATA_PLATE_CONTRACT,
  defaultPlate,
  figurePlate,
  footerPlate,
  gotoDataPlateFixture,
  longPlate,
} from "./support/data-plate";

test.describe("DataPlate element and slot contract", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await gotoDataPlateFixture(page);
  });

  test("renders the default div and both supported semantic alternatives", async ({ page }) => {
    await expect(allDataPlates(page)).toHaveCount(4);

    const roots = await Promise.all([
      defaultPlate(page).evaluate((element) => element.tagName),
      figurePlate(page).evaluate((element) => element.tagName),
      footerPlate(page).evaluate((element) => element.tagName),
    ]);
    expect(roots).toEqual([...DATA_PLATE_CONTRACT.roots]);

    const parents = await Promise.all([
      figurePlate(page).evaluate((element) => element.parentElement?.tagName),
      footerPlate(page).evaluate((element) => element.parentElement?.tagName),
    ]);
    expect(parents).toEqual(["FIGURE", "SECTION"]);

    const roles = await allDataPlates(page).evaluateAll((plates) =>
      plates.map((plate) => plate.getAttribute("role")),
    );
    expect(roles).toEqual([null, null, null, null]);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
  });

  test("preserves authored label-value and sequential slot content in source order", async ({
    page,
  }) => {
    const defaultData = defaultPlate(page);
    await expect(defaultData.locator(":scope > dl")).toHaveCount(1);
    await expect(defaultData.locator("dt")).toHaveText([...DATA_PLATE_CONTRACT.defaultTerms]);
    await expect(defaultData.locator("dd")).toHaveText([...DATA_PLATE_CONTRACT.defaultValues]);

    const sequentialValues = await figurePlate(page)
      .locator(":scope > span, :scope > time")
      .allTextContents();
    expect(sequentialValues.map((value) => value.trim())).toEqual([
      ...DATA_PLATE_CONTRACT.figureValues,
    ]);

    await expect(footerPlate(page).locator("dt")).toHaveText([...DATA_PLATE_CONTRACT.footerTerms]);
    await expect(footerPlate(page).locator("dd")).toHaveText([...DATA_PLATE_CONTRACT.footerValues]);
  });

  test("forwards only the governed class and aria-labelledby extension points", async ({
    page,
  }) => {
    await expect(defaultPlate(page)).toHaveClass(/\bdata-plate\b/);
    await expect(defaultPlate(page)).toHaveClass(/\bdefault-layout\b/);
    await expect(defaultPlate(page)).toHaveAttribute("aria-labelledby", "default-plate-heading");
    await expect(page.locator("#default-plate-heading")).toHaveCount(1);

    await expect(figurePlate(page)).toHaveClass(/\bfigure-layout\b/);
    await expect(figurePlate(page)).not.toHaveAttribute("aria-labelledby");

    await expect(footerPlate(page)).toHaveClass(/\bsection-footer-layout\b/);
    await expect(footerPlate(page)).toHaveAttribute("aria-labelledby", "section-footer-heading");
    await expect(longPlate(page)).toHaveClass(/\blayout-extension\b/);
  });

  test("models caller-owned empty-state omission", async ({ page }) => {
    await expect(page.locator('[data-fixture="empty"]')).toHaveCount(0);
    for (const plate of await allDataPlates(page).all()) {
      expect((await plate.textContent())?.trim().length).toBeGreaterThan(0);
    }
  });

  test("adds no role, focus stop, client script, handler, or generated content", async ({
    page,
  }) => {
    const plates = allDataPlates(page);

    await expect(page.locator("script")).toHaveCount(0);
    await expect(
      plates.locator(
        "a, button, input, select, textarea, summary, [tabindex], [contenteditable], [role]",
      ),
    ).toHaveCount(0);

    const forbiddenAttributes = await plates.evaluateAll((elements) =>
      elements.flatMap((element) =>
        [element, ...element.querySelectorAll("*")].flatMap((candidate) =>
          Array.from(candidate.attributes)
            .map((attribute) => attribute.name)
            .filter((attributeName) => /^on/i.test(attributeName)),
        ),
      ),
    );
    expect(forbiddenAttributes).toEqual([]);

    const generatedContent = await plates.evaluateAll((elements) =>
      elements.flatMap((element) =>
        ["::before", "::after"].map((pseudo) => getComputedStyle(element, pseudo).content),
      ),
    );
    expect(generatedContent.every((content) => content === "none" || content === "normal")).toBe(
      true,
    );
  });
});

test.describe("DataPlate Datum rendering", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await gotoDataPlateFixture(page);
  });

  test("uses the decorative hairline and 8 px separation without panel treatment", async ({
    page,
  }) => {
    const borderColor = await cssTokenAsColor(page, "--border-c");

    for (const plate of await allDataPlates(page).all()) {
      const style = await plate.evaluate((element) => {
        const computed = getComputedStyle(element);
        return {
          backgroundColor: computed.backgroundColor,
          borderBlockStartColor: computed.borderBlockStartColor,
          borderBlockStartStyle: computed.borderBlockStartStyle,
          borderBlockStartWidth: computed.borderBlockStartWidth,
          borderRadius: computed.borderRadius,
          boxShadow: computed.boxShadow,
          paddingBlockStart: computed.paddingBlockStart,
        };
      });

      expect(style.borderBlockStartWidth).toBe("1px");
      expect(style.borderBlockStartStyle).toBe("solid");
      expect(style.borderBlockStartColor).toBe(borderColor);
      expect(style.paddingBlockStart).toBe("8px");
      expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
      expect(style.borderRadius).toBe("0px");
      expect(style.boxShadow).toBe("none");
    }
  });

  test("uses IBM Plex Mono, the data size, muted text, and disciplined numerals", async ({
    page,
  }) => {
    const mutedColor = await cssTokenAsColor(page, "--text-muted");

    for (const plate of await allDataPlates(page).all()) {
      const style = await plate.evaluate((element) => {
        const computed = getComputedStyle(element);
        return {
          color: computed.color,
          fontFamily: computed.fontFamily,
          fontFeatureSettings: computed.fontFeatureSettings,
          fontSize: computed.fontSize,
          fontVariantNumeric: computed.fontVariantNumeric,
        };
      });

      expect(style.fontFamily).toContain("IBM Plex Mono");
      expect(style.fontSize).toBe("13px");
      expect(style.color).toBe(mutedColor);
      expect(style.fontVariantNumeric).toContain("tabular-nums");
      expect(style.fontFeatureSettings).toContain("zero");
    }
  });

  test("keeps the class extension layout-only", async ({ page }) => {
    const baseStyle = await defaultPlate(page).evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        borderColor: style.borderBlockStartColor,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
        color: style.color,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
      };
    });
    const extensionStyle = await longPlate(page).evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        borderColor: style.borderBlockStartColor,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
        color: style.color,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        maxInlineSize: style.maxInlineSize,
      };
    });

    expect(extensionStyle).toMatchObject(baseStyle);
    expect(extensionStyle.maxInlineSize).toBe("416px");
  });

  test("does not use International Orange as plate decoration", async ({ page }) => {
    const accentColor = await cssTokenAsColor(page, "--accent");
    const matches = await allDataPlates(page).evaluateAll((plates, accent) => {
      const decorated = new Set<string>();

      for (const plate of plates) {
        for (const element of [plate, ...plate.querySelectorAll("*")]) {
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
              decorated.add(`${element.tagName.toLowerCase()}${pseudo ?? ""}`);
            }
          }
        }
      }

      return [...decorated];
    }, accentColor);

    expect(matches).toEqual([]);
  });

  test("classifies the low-contrast boundary as decorative", async ({ page }) => {
    const [borderColor, backgroundColor] = await Promise.all([
      cssTokenAsColor(page, "--border-c"),
      cssTokenAsColor(page, "--bg"),
    ]);
    const ratio = contrastRatio(borderColor, backgroundColor);
    expect(ratio).toBeGreaterThan(1.4);
    expect(ratio).toBeLessThan(1.6);
    expect(ratio).toBeLessThan(3);

    const before = await defaultPlate(page).locator("dt, dd").allTextContents();
    await page.addStyleTag({ content: ".data-plate { border-block-start: 0 !important; }" });
    const after = await defaultPlate(page).locator("dt, dd").allTextContents();

    expect(after).toEqual(before);
    await expect(defaultPlate(page)).toBeVisible();
    await expect(defaultPlate(page).locator("dl")).toHaveCount(1);
  });
});
