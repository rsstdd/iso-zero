import { expect, test } from "@playwright/test";
import { gotoHomepage, HOME, identity, siteHeader } from "./support/homepage";

test.describe("ISO Null instrument-index branding", () => {
	test.beforeEach(async ({ page }) => {
		await gotoHomepage(page);
	});

	test("reuses the governed compact and display variants", async ({ page }) => {
		const compact = siteHeader(page).locator('[data-brand-wordmark="compact"]');
		const display = identity(page).locator('[data-brand-wordmark="display"]');

		await expect(compact).toHaveCount(1);
		await expect(display).toHaveCount(1);
		await expect(compact).toHaveText(HOME.identity);
		await expect(display).toHaveText(HOME.identity);
		await expect(compact.locator(":scope > span")).toHaveCount(2);
		await expect(display.locator(":scope > span")).toHaveCount(2);
	});

	test("preserves the home-link and level-one heading names", async ({ page }) => {
		await expect(
			siteHeader(page).getByRole("link", { name: HOME.identity, exact: true }),
		).toHaveAttribute("href", "/");
		await expect(
			page.getByRole("heading", { level: 1, name: HOME.identity, exact: true }),
		).toHaveCount(1);
	});

	test("uses the Datum type and color system without logo decoration", async ({ page }) => {
		for (const mark of [
			siteHeader(page).locator('[data-brand-wordmark="compact"]'),
			identity(page).locator('[data-brand-wordmark="display"]'),
		]) {
			const styles = await mark.evaluate((element) => {
				const computed = getComputedStyle(element);
				return {
					background: computed.backgroundColor,
					border: computed.borderStyle,
					color: computed.color,
					display: computed.display,
					fontFamily: computed.fontFamily,
					shadow: computed.boxShadow,
					transform: computed.textTransform,
				};
			});
			expect(styles.display).toBe("inline-grid");
			expect(styles.fontFamily).toContain("IBM Plex Serif");
			expect(styles.transform).toBe("uppercase");
			expect(styles.background).toBe("rgba(0, 0, 0, 0)");
			expect(styles.border).toBe("none");
			expect(styles.shadow).toBe("none");
			expect(styles.color).toBe("rgb(237, 231, 219)");
		}
	});

	test("keeps both marks complete at 320 CSS pixels", async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 900 });
		await gotoHomepage(page);

		for (const mark of await page.locator("[data-brand-wordmark]").all()) {
			const box = await mark.boundingBox();
			expect(box).not.toBeNull();
			expect(box?.x ?? 0).toBeGreaterThanOrEqual(0);
			expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
		}
	});

	test("remains visible in forced colors", async ({ page }) => {
		await page.emulateMedia({ forcedColors: "active" });
		await gotoHomepage(page);
		for (const mark of await page.locator("[data-brand-wordmark]").all()) {
			await expect(mark).toBeVisible();
			await expect(mark).toHaveCSS("color", "rgb(255, 255, 255)");
		}
	});

	test("adds no image, SVG, script, or focus target for the mark", async ({ page }) => {
		await expect(
			page.locator("[data-brand-wordmark] img, [data-brand-wordmark] svg, [data-brand-wordmark] script"),
		).toHaveCount(0);
		await expect(page.locator("[data-brand-wordmark] [tabindex]")).toHaveCount(0);
	});
});
