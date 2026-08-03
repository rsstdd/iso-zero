import { expect, test } from "@playwright/test";
import {
	cssTokenAsColor,
	effectiveBackground,
	FEATURED_GALLERY_CONTRACT,
	featuredAction,
	featuredFigure,
	featuredGallery,
	featuredImage,
	featuredMeta,
	featuredPicture,
	featuredPlate,
	featuredTitle,
	gotoFeaturedGallery,
	responsiveCandidates,
} from "./support/featured-gallery";

test.describe("FeaturedGallery contract", () => {
	test.beforeEach(async ({ page }) => {
		await gotoFeaturedGallery(page);
	});

	test("renders one native linked figure with the exact launch content", async ({
		page,
	}) => {
		const link = featuredGallery(page);
		const figure = featuredFigure(page);
		const plate = featuredPlate(page);

		await expect(link).toHaveCount(1);
		await expect(link).toHaveAttribute("href", FEATURED_GALLERY_CONTRACT.href);
		await expect(link).toHaveAttribute(
			"aria-labelledby",
			"featured-action featured-title",
		);
		await expect(link).toHaveAttribute(
			"aria-describedby",
			"featured-image-description featured-meta",
		);
		await expect(link).not.toHaveAttribute("role");
		await expect(figure).toHaveCount(1);
		await expect(plate).toHaveCount(1);

		await expect(featuredTitle(page)).toHaveText(
			FEATURED_GALLERY_CONTRACT.title,
		);
		await expect(featuredMeta(page).locator(":scope > span").nth(0)).toHaveText(
			FEATURED_GALLERY_CONTRACT.location,
		);
		await expect(featuredMeta(page).locator(":scope > time")).toHaveText(
			FEATURED_GALLERY_CONTRACT.publication,
		);
		await expect(featuredMeta(page).locator(":scope > time")).toHaveAttribute(
			"datetime",
			FEATURED_GALLERY_CONTRACT.publicationDateTime,
		);
		await expect(featuredMeta(page).locator(":scope > span").nth(1)).toHaveText(
			FEATURED_GALLERY_CONTRACT.imageCount,
		);
		await expect(featuredAction(page)).toHaveText(/Enter gallery\s*→/);
	});

	test("assembles the exact action-first name and ordered description", async ({
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
		await expect(featuredImage(page)).toHaveAttribute(
			"alt",
			FEATURED_GALLERY_CONTRACT.alt,
		);
		await expect(page.locator("#featured-image-description")).toHaveText(
			FEATURED_GALLERY_CONTRACT.alt,
		);
		await expect(
			featuredAction(page).locator('[aria-hidden="true"]'),
		).toHaveText("→");
	});

	test("keeps title, description, metadata, and action in invariant source order", async ({
		page,
	}) => {
		const order = await featuredPlate(page)
			.locator(":scope > *")
			.evaluateAll((elements) =>
				elements.map((element) => ({
					id: element.id,
					order: getComputedStyle(element).order,
				})),
			);

		expect(order).toEqual([
			{ id: "featured-title", order: "0" },
			{ id: "featured-image-description", order: "0" },
			{ id: "featured-meta", order: "0" },
			{ id: "featured-action", order: "0" },
		]);
	});

	test("makes the photograph and plate activate the same resolved route", async ({
		page,
	}) => {
		const hrefs = await Promise.all([
			featuredImage(page).evaluate((element) =>
				element.closest("a")?.getAttribute("href"),
			),
			featuredPlate(page).evaluate((element) =>
				element.closest("a")?.getAttribute("href"),
			),
		]);
		expect(hrefs).toEqual([
			FEATURED_GALLERY_CONTRACT.href,
			FEATURED_GALLERY_CONTRACT.href,
		]);

		await featuredImage(page).click();
		await expect(page).toHaveURL(
			new RegExp(`${FEATURED_GALLERY_CONTRACT.href}$`),
		);
		await expect(
			page.getByRole("heading", { level: 1, name: "venice gallery" }),
		).toBeVisible();

		await gotoFeaturedGallery(page);
		await featuredPlate(page).click({ position: { x: 8, y: 8 } });
		await expect(page).toHaveURL(
			new RegExp(`${FEATURED_GALLERY_CONTRACT.href}$`),
		);
	});

	test("emits the governed responsive formats, widths, dimensions, and LCP hints", async ({
		page,
	}) => {
		const picture = featuredPicture(page);
		const image = featuredImage(page);
		const candidates = await responsiveCandidates(page);

		await expect(picture.locator('source[type="image/avif"]')).toHaveCount(1);
		await expect(picture.locator('source[type="image/webp"]')).toHaveCount(1);
		await expect(image).toHaveAttribute("src", /\.jpe?g(?:\?|$)/i);
		await expect(image).toHaveAttribute(
			"width",
			String(FEATURED_GALLERY_CONTRACT.width),
		);
		await expect(image).toHaveAttribute(
			"height",
			String(FEATURED_GALLERY_CONTRACT.height),
		);
		await expect(image).toHaveAttribute("loading", "eager");
		await expect(image).toHaveAttribute("fetchpriority", "high");
		await expect(image).toHaveAttribute("decoding", "async");
		await expect(image).toHaveAttribute("sizes", /\S+/);

		for (const format of ["avif", "webp", "jpeg"] as const) {
			const widths = candidates
				.filter((candidate) => candidate.format === format)
				.map((candidate) => candidate.width)
				.sort((left, right) => left - right);
			expect(widths).toEqual(FEATURED_GALLERY_CONTRACT.candidateWidths);
		}
		expect(
			Math.max(...candidates.map(({ width }) => width)),
		).toBeLessThanOrEqual(2048);
		await expect(page.locator('img[fetchpriority="high"]')).toHaveCount(1);
	});

	test("requests only one responsive hero candidate without preload duplication", async ({
		page,
	}) => {
		const imageRequests: string[] = [];
		page.on("request", (request) => {
			if (request.resourceType() === "image") imageRequests.push(request.url());
		});

		await gotoFeaturedGallery(page, "/?network-check=1");
		const candidateUrls = new Set(
			(await responsiveCandidates(page)).map(({ absoluteUrl }) => absoluteUrl),
		);
		const heroRequests = imageRequests.filter((url) => candidateUrls.has(url));

		expect(heroRequests).toHaveLength(1);
		expect(new Set(heroRequests).size).toBe(1);
	});

	test("renders UTC publication dates and correct singular/plural grammar", async ({
		page,
	}) => {
		const cases = [
			{ path: "/variants/singular/", count: "1 image" },
			{ path: "/variants/plural/", count: "2 images" },
			{ path: "/variants/utc-boundary/", count: "12 images" },
		];

		for (const variant of cases) {
			await gotoFeaturedGallery(page, variant.path);
			await expect(featuredMeta(page).locator("time")).toHaveText(
				"August 2026",
			);
			await expect(
				featuredMeta(page).locator(":scope > span").nth(1),
			).toHaveText(variant.count);
		}
	});

	test("maps title, metadata, action, plate, and canvas to Datum", async ({
		page,
	}) => {
		const [textColor, mutedColor, backgroundColor, borderColor] =
			await Promise.all([
				cssTokenAsColor(page, "--text"),
				cssTokenAsColor(page, "--text-muted"),
				cssTokenAsColor(page, "--bg"),
				cssTokenAsColor(page, "--border-c"),
			]);
		const styles = await Promise.all([
			featuredTitle(page).evaluate((element) => {
				const style = getComputedStyle(element);
				return { color: style.color, family: style.fontFamily };
			}),
			featuredMeta(page).evaluate((element) => {
				const style = getComputedStyle(element);
				return {
					color: style.color,
					family: style.fontFamily,
					numeric: style.fontVariantNumeric,
				};
			}),
			featuredAction(page).evaluate((element) => {
				const style = getComputedStyle(element);
				return {
					color: style.color,
					decoration: style.textDecorationLine,
					family: style.fontFamily,
				};
			}),
			featuredPlate(page).evaluate((element) => {
				const style = getComputedStyle(element);
				return {
					background: style.backgroundColor,
					borderColor: style.borderTopColor,
					borderRadius: style.borderRadius,
					borderWidth: style.borderTopWidth,
					boxShadow: style.boxShadow,
				};
			}),
		]);

		expect(styles[0].family).toContain("IBM Plex Serif");
		expect(styles[0].color).toBe(textColor);
		expect(styles[1].family).toContain("IBM Plex Mono");
		expect(styles[1].color).toBe(mutedColor);
		expect(styles[1].numeric).toContain("tabular-nums");
		expect(styles[2].family).toContain("IBM Plex Sans");
		expect(styles[2].color).toBe(textColor);
		expect(styles[2].decoration).toContain("underline");
		expect(styles[3]).toEqual({
			background: "rgba(0, 0, 0, 0)",
			borderColor,
			borderRadius: "0px",
			borderWidth: "1px",
			boxShadow: "none",
		});
		expect(await effectiveBackground(featuredFigure(page))).toBe(
			backgroundColor,
		);
	});

	test("keeps the photograph uncropped, square, unfiltered, and shadowless", async ({
		page,
	}) => {
		const styles = await Promise.all([
			featuredFigure(page).evaluate((element) => {
				const style = getComputedStyle(element);
				return {
					backgroundImage: style.backgroundImage,
					borderRadius: style.borderRadius,
					boxShadow: style.boxShadow,
					clipPath: style.clipPath,
					overflow: style.overflow,
				};
			}),
			featuredImage(page).evaluate((element) => {
				const style = getComputedStyle(element);
				const box = element.getBoundingClientRect();
				return {
					aspectRatio: box.width / box.height,
					borderRadius: style.borderRadius,
					boxShadow: style.boxShadow,
					clipPath: style.clipPath,
					filter: style.filter,
					objectFit: style.objectFit,
				};
			}),
		]);

		expect(styles[0].backgroundImage).toBe("none");
		expect(styles[0].borderRadius).toBe("0px");
		expect(styles[0].boxShadow).toBe("none");
		expect(styles[0].clipPath).toBe("none");
		expect(["hidden", "clip"]).not.toContain(styles[0].overflow);
		expect(styles[1].aspectRatio).toBeCloseTo(2048 / 1155, 2);
		expect(styles[1].borderRadius).toBe("0px");
		expect(styles[1].boxShadow).toBe("none");
		expect(styles[1].clipPath).toBe("none");
		expect(styles[1].filter).toBe("none");
		expect(styles[1].objectFit).not.toBe("cover");
	});

	test("contains no nested controls, prohibited metadata, placeholders, or client behavior", async ({
		page,
	}) => {
		const component = featuredGallery(page);
		const forbiddenText =
			/EXIF|camera|lens|SKU|price|capture date|purchase|view details/i;

		await expect(
			component.locator("a, button, input, select, textarea, summary"),
		).toHaveCount(0);
		await expect(component).not.toContainText(forbiddenText);
		await expect(
			component.locator("script, [client\\:load], [client\\:visible]"),
		).toHaveCount(0);
		expect(
			await component.evaluate((element) =>
				[...element.querySelectorAll("*")].flatMap((candidate) =>
					[...candidate.attributes]
						.map(({ name }) => name)
						.filter((name) => /^on/i.test(name)),
				),
			),
		).toEqual([]);
		await expect(page.locator("script")).toHaveCount(0);
	});
});
