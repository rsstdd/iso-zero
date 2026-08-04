import { expect, test } from "@playwright/test";
import {
	directory,
	expectNoHorizontalOverflow,
	expectSharedInlineOrigin,
	expectVisibleTextNotTruncated,
	featured,
	featuredImage,
	gotoHomepage,
	HOME,
	HOME_VIEWPORTS,
	identity,
	main,
	siteFooter,
	siteHeader,
} from "./support/homepage";

test.describe("IS0 ZER0 homepage reflow", () => {
	for (const viewport of HOME_VIEWPORTS) {
		test(`${viewport.name}: preserves content, order, alignment, and the complete hero`, async ({
			page,
		}) => {
			await page.setViewportSize(viewport);
			await gotoHomepage(page);

			await expectNoHorizontalOverflow(page);
			await expectSharedInlineOrigin(page);
			await expectVisibleTextNotTruncated(page.locator("body"));
			await expect(featured(page).locator("#featured-meta time")).toHaveText(
				HOME.featured.publication,
			);

			const pageOrder = await main(page)
				.locator(":scope > *")
				.evaluateAll((elements) =>
					elements.map((element) => ({
						key:
							element.id ||
							[...element.classList].find((name) =>
								[
									"homepage-identity",
									"featured-gallery",
									"rule-datum",
								].includes(name),
							),
						order: getComputedStyle(element).order,
					})),
				);
			expect(pageOrder).toEqual([
				{ key: "homepage-identity", order: "0" },
				{ key: "featured-gallery", order: "0" },
				{ key: "rule-datum", order: "0" },
			]);

			const imageGeometry = await featuredImage(page).evaluate((image) => {
				const element = image as HTMLImageElement;
				const style = getComputedStyle(element);
				const rect = element.getBoundingClientRect();
				return {
					clipPath: style.clipPath,
					filter: style.filter,
					height: rect.height,
					naturalRatio: element.naturalWidth / element.naturalHeight,
					objectFit: style.objectFit,
					overflow: style.overflow,
					renderedRatio: rect.width / rect.height,
					width: rect.width,
				};
			});
			expect(imageGeometry.width).toBeGreaterThan(0);
			expect(imageGeometry.height).toBeGreaterThan(0);
			expect(imageGeometry.renderedRatio).toBeCloseTo(
				imageGeometry.naturalRatio,
				2,
			);
			expect(imageGeometry.objectFit).not.toBe("cover");
			expect(imageGeometry.clipPath).toBe("none");
			expect(imageGeometry.filter).toBe("none");
			expect(imageGeometry.height).toBeLessThanOrEqual(
				viewport.height * 0.72 + 1,
			);
		});
	}

	test("320 CSS px represents the 400% reflow width from a 1280 CSS px viewport", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 900 });
		await gotoHomepage(page);
		await expectNoHorizontalOverflow(page);

		const lineCounts = await identity(page)
			.locator(":scope > h1, :scope > p")
			.evaluateAll((elements) =>
				elements.map((element) => {
					const style = getComputedStyle(element);
					return (
						element.getBoundingClientRect().height /
						Number.parseFloat(style.lineHeight)
					);
				}),
			);
		expect(lineCounts).toHaveLength(2);
		for (const lines of lineCounts) expect(lines).toBeLessThan(1.25);
	});

	test("200% text enlargement preserves all copy without collision or clipping", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 1200 });
		await gotoHomepage(page);
		await page.addStyleTag({ content: "html { font-size: 200% !important; }" });

		await expectNoHorizontalOverflow(page);
		await expectVisibleTextNotTruncated(page.locator("body"));
		await expect(page.getByText(HOME.byline, { exact: true })).toBeVisible();
		await expect(
			page.getByText(HOME.featured.publication, { exact: true }),
		).toBeVisible();
		await expect(
			page.getByText(HOME.directory.heading, { exact: true }),
		).toBeVisible();
		await expectRegionsDoNotOverlap(page);
	});

	test("WCAG text spacing overrides preserve page content and source order", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 1200 });
		await gotoHomepage(page);
		await page.addStyleTag({
			content: `
				body * {
					line-height: 1.5 !important;
					letter-spacing: 0.12em !important;
					word-spacing: 0.16em !important;
				}
				p { margin-block-end: 2em !important; }
			`,
		});
		await expectNoHorizontalOverflow(page);
		await expectVisibleTextNotTruncated(page.locator("body"));
		await expectRegionsDoNotOverlap(page);
		await expect(featured(page).locator("#featured-meta time")).toHaveText(
			HOME.featured.publication,
		);
	});

	test("font-request failure leaves the complete page legible", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 1200 });
		await page.route("**/*", async (route) => {
			const pathname = new URL(route.request().url()).pathname;
			if (/\.(?:woff2?|ttf|otf)$/i.test(pathname)) {
				await route.abort();
				return;
			}
			await route.continue();
		});
		await gotoHomepage(page);

		await expectNoHorizontalOverflow(page);
		await expectVisibleTextNotTruncated(page.locator("body"));
		await expect(
			page.getByRole("heading", { level: 1, name: HOME.identity }),
		).toBeVisible();
		await expect(featuredImage(page)).toBeVisible();
		await expect(
			page.getByRole("heading", { level: 2, name: HOME.directory.heading }),
		).toBeVisible();
		await expectRegionsDoNotOverlap(page);
	});

	test("major regions grow in source order rather than using fixed heights", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await gotoHomepage(page);

		const regions = [
			siteHeader(page),
			identity(page),
			featured(page),
			directory(page),
			siteFooter(page),
		];
		for (const region of regions) {
			const style = await region.evaluate(
				(element) => getComputedStyle(element).height,
			);
			expect(style).not.toBe("0px");
		}
		await expectRegionsDoNotOverlap(page);
	});
});

async function expectRegionsDoNotOverlap(
	page: Parameters<typeof siteHeader>[0],
): Promise<void> {
	const boxes = await Promise.all(
		[
			siteHeader(page),
			identity(page),
			featured(page),
			directory(page),
			siteFooter(page),
		].map((locator) => locator.boundingBox()),
	);
	for (const box of boxes) expect(box).not.toBeNull();
	for (let index = 0; index < boxes.length - 1; index += 1) {
		const current = boxes[index];
		const next = boxes[index + 1];
		expect((current?.y ?? 0) + (current?.height ?? 0)).toBeLessThanOrEqual(
			(next?.y ?? 0) + 1,
		);
	}
}
