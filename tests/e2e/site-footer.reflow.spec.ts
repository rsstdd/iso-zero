import { expect, test } from "@playwright/test";
import {
  expectLinkTargetAtLeast,
  expectNoHorizontalOverflow,
  gotoRoute,
  siteFooter,
} from "./support/site-footer";

test.describe("SiteFooter reflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 1000 });
    await gotoRoute(page);
  });

  test("stacks Project, Legal, and build data in source order at 320 CSS px", async ({ page }) => {
    const footer = siteFooter(page);
    const project = footer.getByRole("navigation", { name: "Project", exact: true });
    const legal = footer.getByRole("navigation", { name: "Legal", exact: true });
    const dataPlate = footer.locator(".data-plate");

    const [projectBox, legalBox, dataPlateBox] = await Promise.all([
      project.boundingBox(),
      legal.boundingBox(),
      dataPlate.boundingBox(),
    ]);

    expect(projectBox).not.toBeNull();
    expect(legalBox).not.toBeNull();
    expect(dataPlateBox).not.toBeNull();
    expect(legalBox?.y).toBeGreaterThanOrEqual((projectBox?.y ?? 0) + (projectBox?.height ?? 0));
    expect(dataPlateBox?.y).toBeGreaterThanOrEqual((legalBox?.y ?? 0) + (legalBox?.height ?? 0));

    const layoutOrder = await footer
      .locator(".site-footer__inner > *")
      .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).order));
    expect(layoutOrder).toEqual(["0", "0", "0"]);
  });

  test("keeps every footer link at least 44 by 44 CSS px without overflow", async ({ page }) => {
    for (const link of await siteFooter(page).getByRole("link").all()) {
      await expectLinkTargetAtLeast(link);
    }
    await expectNoHorizontalOverflow(page);
  });

  test("survives WCAG text spacing and representative long legal labels", async ({ page }) => {
    await page.addStyleTag({
      content: `
        footer.site-footer,
        footer.site-footer * {
          line-height: 1.5 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        }

        footer.site-footer p {
          margin-block-end: 2em !important;
        }
      `,
    });

    await page.evaluate(() => {
      const replacements = new Map([
        ["About", "Über dieses fotografische Projekt"],
        ["Engineering case study", "Technische Fallstudie und Implementierungsnachweis"],
        ["Impressum", "Anbieterkennzeichnung und Impressum"],
        ["Datenschutz", "Datenschutzerklärung und Informationen zur Verarbeitung"],
        ["AGB", "Allgemeine Geschäftsbedingungen und Widerrufsbelehrung"],
      ]);

      for (const link of document.querySelectorAll<HTMLAnchorElement>("footer.site-footer a")) {
        const replacement = replacements.get(link.textContent?.trim() ?? "");
        if (replacement) link.textContent = replacement;
      }
    });

    await expectNoHorizontalOverflow(page);

    const linkMetrics = await siteFooter(page)
      .getByRole("link")
      .evaluateAll((links) =>
        links.map((link) => {
          const element = link as HTMLElement;
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            bottom: rect.bottom,
            clientWidth: element.clientWidth,
            left: rect.left,
            overflow: style.overflow,
            right: rect.right,
            scrollWidth: element.scrollWidth,
            textOverflow: style.textOverflow,
            top: rect.top,
            whiteSpace: style.whiteSpace,
          };
        }),
      );

    for (const metric of linkMetrics) {
      expect(metric.scrollWidth).toBeLessThanOrEqual(metric.clientWidth + 1);
      expect(metric.overflow).not.toBe("hidden");
      expect(metric.textOverflow).not.toBe("ellipsis");
      expect(metric.whiteSpace).not.toBe("nowrap");
    }

    for (const [index, current] of linkMetrics.entries()) {
      for (const candidate of linkMetrics.slice(index + 1)) {
        const separated =
          current.right <= candidate.left ||
          candidate.right <= current.left ||
          current.bottom <= candidate.top ||
          candidate.bottom <= current.top;
        expect(separated, "Expanded footer links must not overlap").toBe(true);
      }
    }
  });
});
