import { expect, test } from "@playwright/test";
import {
	expectBrowserSelectedLayoutCandidate,
	expectNoHorizontalOverflow,
	expectVisibleTextNotTruncated,
	FEATURED_GALLERY_CONTRACT,
	featuredAction,
	featuredFigure,
	featuredGallery,
	featuredImage,
	featuredMeta,
	featuredPlate,
	featuredTitle,
	gotoFeaturedGallery,
	REFLOW_VIEWPORTS,
} from "./support/featured-gallery";

test.describe("FeaturedGallery responsive image and composition", () => {
	for (const viewport of REFLOW_VIEWPORTS) {
		test(`preserves the complete composition and correct source selection at ${viewport.name}`, async ({
			page,
		}) => {
			await page.setViewportSize({
				width: viewport.width,
				height: viewport.height,
			});
			await gotoFeaturedGallery(page);

			const geometry = await Promise.all([
				featuredGallery(page).evaluate((element) => {
					const box = element.getBoundingClientRect();
					return { left: box.left, right: box.right, width: box.width };
				}),
				featuredFigure(page).evaluate((element) => {
					const box = element.getBoundingClientRect();
					return { center: box.left + box.width / 2 };
				}),
				featuredImage(page).evaluate((element) => {
					const box = element.getBoundingClientRect();
					const style = getComputedStyle(element);
					return {
						aspectRatio: box.width / box.height,
						center: box.left + box.width / 2,
						height: box.height,
						objectFit: style.objectFit,
						width: box.width,
					};
				}),
			]);

			expect(geometry[0].width).toBeGreaterThan(0);
			expect(geometry[0].width).toBeLessThanOrEqual(1400);
			expect(geometry[0].left).toBeCloseTo(
				viewport.width - geometry[0].right,
				0,
			);
			expect(geometry[2].aspectRatio).toBeCloseTo(
				FEATURED_GALLERY_CONTRACT.width / FEATURED_GALLERY_CONTRACT.height,
				2,
			);
			expect(geometry[2].center).toBeCloseTo(geometry[1].center, 0);
			expect(geometry[2].height).toBeLessThanOrEqual(
				viewport.height * 0.72 + 1,
			);
			expect(geometry[2].objectFit).not.toBe("cover");

			await expectBrowserSelectedLayoutCandidate(page);
			await expectVisibleTextNotTruncated(featuredPlate(page));
			await expectNoHorizontalOverflow(page);
		});
	}

	test("places title first and metadata/action below at the narrow layout", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 900 });
		await gotoFeaturedGallery(page);

		const boxes = await Promise.all(
			[featuredTitle(page), featuredMeta(page), featuredAction(page)].map(
				(locator) =>
					locator.evaluate((element) => {
						const box = element.getBoundingClientRect();
						return { bottom: box.bottom, left: box.left, top: box.top };
					}),
			),
		);

		expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom - 1);
		expect(boxes[2].top).toBeGreaterThanOrEqual(boxes[0].bottom - 1);
		expect(boxes[0].left).toBeCloseTo(boxes[1].left, 0);
		expect(boxes[0].left).toBeCloseTo(boxes[2].left, 0);
	});

	test("uses a title column and compact metadata/action group at the wide layout", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1200, height: 900 });
		await gotoFeaturedGallery(page);

		const boxes = await Promise.all(
			[featuredTitle(page), featuredMeta(page), featuredAction(page)].map(
				(locator) =>
					locator.evaluate((element) => {
						const box = element.getBoundingClientRect();
						return { left: box.left, right: box.right, top: box.top };
					}),
			),
		);

		expect(boxes[1].left).toBeGreaterThan(boxes[0].left);
		expect(boxes[2].left).toBeGreaterThanOrEqual(boxes[1].left - 1);
		expect(boxes[1].left).toBeGreaterThanOrEqual(boxes[0].right - 1);
	});
});

test.describe("FeaturedGallery text reflow", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 1000 });
		await gotoFeaturedGallery(page);
	});

	test("preserves content and source order under 200 percent text enlargement", async ({
		page,
	}) => {
		await page.addStyleTag({ content: "html { font-size: 200% !important; }" });

		await expect(featuredTitle(page)).toHaveText(
			FEATURED_GALLERY_CONTRACT.title,
		);
		await expect(featuredMeta(page)).toContainText(
			FEATURED_GALLERY_CONTRACT.location,
		);
		await expect(featuredMeta(page)).toContainText(
			FEATURED_GALLERY_CONTRACT.publication,
		);
		await expect(featuredMeta(page)).toContainText(
			FEATURED_GALLERY_CONTRACT.imageCount,
		);
		await expect(featuredAction(page)).toContainText(
			FEATURED_GALLERY_CONTRACT.action,
		);
		await expectVisibleTextNotTruncated(featuredPlate(page));
		await expectNoHorizontalOverflow(page);

		const order = await featuredPlate(page)
			.locator(":scope > *")
			.evaluateAll((elements) =>
				elements.map((element) => ({
					id: element.id,
					order: getComputedStyle(element).order,
					top: element.getBoundingClientRect().top,
				})),
			);
		expect(order.map(({ id }) => id)).toEqual([
			"featured-title",
			"featured-image-description",
			"featured-meta",
			"featured-action",
		]);
		expect(order.every(({ order: cssOrder }) => cssOrder === "0")).toBe(true);
		expect(order[2].top).toBeGreaterThanOrEqual(order[0].top);
		expect(order[3].top).toBeGreaterThanOrEqual(order[0].top);
	});

	test("survives WCAG text spacing without clipping, overlap, or reordering", async ({
		page,
	}) => {
		await page.addStyleTag({
			content: `
        .featured-gallery__plate,
        .featured-gallery__plate * {
          line-height: 1.5 !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
        }

        .featured-gallery__plate > * + * {
          margin-block-start: 2em !important;
        }
      `,
		});

		await expectVisibleTextNotTruncated(featuredPlate(page));
		await expectNoHorizontalOverflow(page);

		const visibleBoxes = await featuredPlate(page)
			.locator(":scope > :not(.visually-hidden)")
			.evaluateAll((elements) =>
				elements.map((element) => {
					const box = element.getBoundingClientRect();
					return { bottom: box.bottom, top: box.top };
				}),
			);
		for (let index = 1; index < visibleBoxes.length; index += 1) {
			expect(visibleBoxes[index].top).toBeGreaterThanOrEqual(
				visibleBoxes[index - 1].bottom - 1,
			);
		}
	});

	test("retains complete content and hierarchy when custom fonts fail", async ({
		page,
	}) => {
		await page.route(/\.(?:woff2?|ttf)(?:\?.*)?$/i, (route) => route.abort());
		await gotoFeaturedGallery(page, "/?font-failure=1");

		await expect(featuredTitle(page)).toBeVisible();
		await expect(featuredMeta(page)).toBeVisible();
		await expect(featuredAction(page)).toBeVisible();
		await expectVisibleTextNotTruncated(featuredPlate(page));
		await expectNoHorizontalOverflow(page);

		const stacks = await Promise.all([
			featuredTitle(page).evaluate((element) =>
				getComputedStyle(element).fontFamily.toLowerCase(),
			),
			featuredMeta(page).evaluate((element) =>
				getComputedStyle(element).fontFamily.toLowerCase(),
			),
			featuredAction(page).evaluate((element) =>
				getComputedStyle(element).fontFamily.toLowerCase(),
			),
		]);
		expect(stacks[0]).toContain("serif");
		expect(stacks[1]).toContain("monospace");
		expect(stacks[2]).toContain("sans-serif");
	});
});
