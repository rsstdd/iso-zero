import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
	contrastRatio,
	cssTokenAsColor,
	FEATURED_GALLERY_CONTRACT,
	featuredAction,
	featuredGallery,
	featuredImage,
	featuredMeta,
	featuredPlate,
	featuredTitle,
	gotoFeaturedGallery,
} from "./support/featured-gallery";

test.describe("FeaturedGallery accessibility and interaction", () => {
	test.beforeEach(async ({ page }) => {
		await gotoFeaturedGallery(page);
	});

	test("has no WCAG 2.2 A or AA axe violations in the complete fixture", async ({
		page,
	}) => {
		const results = await new AxeBuilder({ page })
			.include("main")
			.withTags([
				"wcag2a",
				"wcag2aa",
				"wcag21a",
				"wcag21aa",
				"wcag22a",
				"wcag22aa",
			])
			.analyze();

		expect(results.violations).toEqual([]);
	});

	test("uses native link semantics with one focus stop and no nested interactive descendant", async ({
		page,
	}) => {
		const link = page.getByRole("link", {
			name: FEATURED_GALLERY_CONTRACT.accessibleName,
			exact: true,
		});

		await expect(link).toHaveCount(1);
		await expect(link).toHaveAccessibleDescription(
			FEATURED_GALLERY_CONTRACT.accessibleDescription,
		);
		await expect(
			link.locator("a, button, input, select, textarea, summary, [tabindex]"),
		).toHaveCount(0);

		await page.keyboard.press("Tab");
		await expect(link).toBeFocused();
	});

	test("activates with Enter", async ({ page }) => {
		const link = featuredGallery(page);
		await link.focus();
		await page.keyboard.press("Enter");

		await expect(page).toHaveURL(
			new RegExp(`${FEATURED_GALLERY_CONTRACT.href}$`),
		);
		await expect(
			page.getByRole("heading", { level: 1, name: "venice gallery" }),
		).toBeVisible();
	});

	test("keeps Space as native page scrolling rather than link activation", async ({
		page,
	}) => {
		const link = featuredGallery(page);
		await page.evaluate(() => window.scrollTo(0, 0));
		await link.focus();
		const hrefBefore = page.url();

		await page.keyboard.press("Space");

		await expect(page).toHaveURL(hrefBefore);
		await expect
			.poll(() => page.evaluate(() => window.scrollY))
			.toBeGreaterThan(0);
	});

	test("draws one accent focus outline around the complete compound link", async ({
		page,
	}) => {
		const link = featuredGallery(page);
		const focusColor = await cssTokenAsColor(page, "--focus-ring");
		await link.focus();

		const linkStyle = await link.evaluate((element) => {
			const style = getComputedStyle(element);
			return {
				offset: style.outlineOffset,
				color: style.outlineColor,
				style: style.outlineStyle,
				width: style.outlineWidth,
			};
		});
		expect(linkStyle).toEqual({
			offset: "2px",
			color: focusColor,
			style: "solid",
			width: "2px",
		});

		const descendantOutlines = await featuredPlate(page).evaluate((element) =>
			[...element.querySelectorAll("*")].map(
				(candidate) => getComputedStyle(candidate).outlineStyle,
			),
		);
		expect(descendantOutlines.every((style) => style === "none")).toBe(true);
	});

	test("keeps the action persistently underlined and hover feedback layout-stable", async ({
		page,
	}) => {
		const link = featuredGallery(page);
		const action = featuredAction(page);
		const arrow = action.locator('[aria-hidden="true"]');
		const before = await Promise.all([
			action.evaluate((element) => {
				const style = getComputedStyle(element);
				return {
					line: style.textDecorationLine,
					thickness: Number.parseFloat(style.textDecorationThickness),
				};
			}),
			link.boundingBox(),
		]);

		await link.hover();
		const after = await Promise.all([
			action.evaluate((element) => {
				const style = getComputedStyle(element);
				return {
					line: style.textDecorationLine,
					thickness: Number.parseFloat(style.textDecorationThickness),
				};
			}),
			arrow.evaluate((element) => getComputedStyle(element).transform),
			link.boundingBox(),
		]);

		expect(before[0].line).toContain("underline");
		expect(after[0].line).toContain("underline");
		expect(after[0].thickness).toBeGreaterThanOrEqual(before[0].thickness);
		expect(translationX(after[1])).toBeLessThanOrEqual(2.01);
		expect(translationX(after[1])).toBeGreaterThanOrEqual(0);
		expect(after[2]?.width).toBeCloseTo(before[1]?.width ?? 0, 1);
		expect(after[2]?.height).toBeCloseTo(before[1]?.height ?? 0, 1);

		await page.mouse.down();
		expect(
			await link.evaluate((element) => getComputedStyle(element).transform),
		).toBe("none");
		await page.mouse.up();
	});

	test("removes decorative arrow translation under reduced motion", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await gotoFeaturedGallery(page, "/?reduced-motion=1");
		await featuredGallery(page).hover();

		const arrow = featuredAction(page).locator('[aria-hidden="true"]');
		expect(
			translationX(
				await arrow.evaluate((element) => getComputedStyle(element).transform),
			),
		).toBe(0);
	});

	test("meets text contrast for title, action, and compact metadata", async ({
		page,
	}) => {
		const [background, titleColor, metadataColor, actionColor] =
			await Promise.all([
				cssTokenAsColor(page, "--bg"),
				featuredTitle(page).evaluate(
					(element) => getComputedStyle(element).color,
				),
				featuredMeta(page).evaluate(
					(element) => getComputedStyle(element).color,
				),
				featuredAction(page).evaluate(
					(element) => getComputedStyle(element).color,
				),
			]);

		expect(contrastRatio(titleColor, background)).toBeGreaterThanOrEqual(7);
		expect(contrastRatio(actionColor, background)).toBeGreaterThanOrEqual(7);
		expect(contrastRatio(metadataColor, background)).toBeGreaterThanOrEqual(
			4.5,
		);
	});

	test("preserves image text alternative, link affordance, and focus in forced colours", async ({
		browserName,
		page,
	}) => {
		test.skip(
			browserName !== "chromium",
			"forced-colors emulation is verified in Chromium",
		);

		await page.emulateMedia({ forcedColors: "active" });
		await gotoFeaturedGallery(page, "/?forced-colors=1");
		await featuredGallery(page).focus();

		await expect(featuredImage(page)).toHaveAttribute(
			"alt",
			FEATURED_GALLERY_CONTRACT.alt,
		);
		await expect(featuredAction(page)).toHaveCSS(
			"text-decoration-line",
			/underline/,
		);
		const outline = await featuredGallery(page).evaluate((element) => {
			const style = getComputedStyle(element);
			return {
				style: style.outlineStyle,
				width: Number.parseFloat(style.outlineWidth),
			};
		});
		expect(outline.style).toBe("solid");
		expect(outline.width).toBeGreaterThanOrEqual(2);

		const results = await new AxeBuilder({ page })
			.include("main")
			.withTags([
				"wcag2a",
				"wcag2aa",
				"wcag21a",
				"wcag21aa",
				"wcag22a",
				"wcag22aa",
			])
			.analyze();
		expect(results.violations).toEqual([]);
	});
});

function translationX(transform: string): number {
	if (transform === "none") return 0;
	const matrix = transform
		.match(/^matrix\(([^)]+)\)$/)?.[1]
		.split(",")
		.map(Number);
	if (!matrix || matrix.length !== 6) {
		throw new Error(`Unsupported transform matrix: ${transform}`);
	}
	return matrix[4];
}
