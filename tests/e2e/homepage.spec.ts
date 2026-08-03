import { expect, test } from "@playwright/test";
import {
	directory,
	directoryRows,
	expectSharedInlineOrigin,
	featured,
	featuredImage,
	gotoHomepage,
	HOME,
	identity,
	main,
	persistentAccentMarks,
	siteFooter,
	siteHeader,
} from "./support/homepage";

test.describe("ISO Null homepage contract", () => {
	test.beforeEach(async ({ page }) => {
		await gotoHomepage(page);
	});

	test("composes the shell and three homepage components in invariant order", async ({
		page,
	}) => {
		const bodyOrder = await page.locator("body > *").evaluateAll((elements) =>
			elements.map((element) => ({
				className: element.className,
				id: element.id,
				tag: element.tagName.toLowerCase(),
			})),
		);
		expect(bodyOrder).toEqual([
			{ className: "skip-link", id: "", tag: "a" },
			{ className: "site-header", id: "", tag: "header" },
			{ className: "", id: "main", tag: "main" },
			{ className: "site-footer", id: "", tag: "footer" },
		]);

		const mainOrder = await main(page)
			.locator(":scope > *")
			.evaluateAll((elements) =>
				elements.map((element) => ({
					className: element.className,
					tag: element.tagName.toLowerCase(),
				})),
			);
		expect(mainOrder).toEqual([
			{
				className: expect.stringContaining("homepage-identity"),
				tag: "section",
			},
			{ className: expect.stringContaining("featured-gallery"), tag: "a" },
			{ className: expect.stringContaining("rule-datum"), tag: "section" },
		]);

		await expect(page.locator("main")).toHaveCount(1);
		await expect(page.locator("header.site-header")).toHaveCount(1);
		await expect(page.locator("footer.site-footer")).toHaveCount(1);
	});

	test("renders the exact homepage identity and heading hierarchy", async ({
		page,
	}) => {
		const identityBlock = identity(page);
		await expect(identityBlock).toHaveAttribute(
			"aria-labelledby",
			"page-title",
		);
		await expect(identityBlock).not.toHaveAttribute("role");
		await expect(identityBlock.locator(":scope > h1#page-title")).toHaveText(
			HOME.identity,
		);
		await expect(identityBlock.locator(":scope > p")).toHaveText(HOME.byline);

		const headings = await page.locator("h1, h2, h3").evaluateAll((elements) =>
			elements.map((element) => ({
				level: Number.parseInt(element.tagName.slice(1), 10),
				text: element.textContent?.trim(),
			})),
		);
		expect(headings).toEqual([
			{ level: 1, text: HOME.identity },
			{ level: 2, text: HOME.featured.title },
			{ level: 2, text: HOME.directory.heading },
			{ level: 3, text: HOME.directory.title },
		]);
	});

	test("makes the Venice feature the primary action with the governed launch data", async ({
		page,
	}) => {
		const feature = featured(page);
		await expect(feature).toHaveCount(1);
		await expect(feature).toHaveAttribute("href", HOME.featured.href);
		await expect(feature).toHaveAttribute(
			"aria-labelledby",
			"featured-action featured-title",
		);
		await expect(feature.locator("#featured-title")).toHaveText(
			HOME.featured.title,
		);
		await expect(feature.locator("#featured-meta > span").nth(0)).toHaveText(
			HOME.featured.location,
		);
		await expect(feature.locator("#featured-meta time")).toHaveText(
			HOME.featured.publication,
		);
		await expect(feature.locator("#featured-meta time")).toHaveAttribute(
			"datetime",
			HOME.featured.publicationDateTime,
		);
		await expect(feature.locator("#featured-meta > span").nth(1)).toHaveText(
			HOME.featured.count,
		);
		await expect(feature.locator("#featured-action")).toContainText(
			HOME.featured.action,
		);

		const firstMainLink = main(page).locator("a[href]").first();
		await expect(firstMainLink).toHaveAttribute("href", HOME.featured.href);
	});

	test("uses the governed hero derivative and reserves its LCP geometry", async ({
		page,
	}) => {
		const image = featuredImage(page);
		await expect(image).toHaveAttribute("alt", HOME.featured.alt);
		await expect(image).toHaveAttribute("width", String(HOME.featured.width));
		await expect(image).toHaveAttribute("height", String(HOME.featured.height));
		await expect(image).toHaveAttribute("loading", "eager");
		await expect(image).toHaveAttribute("fetchpriority", "high");
		await expect(image).toHaveAttribute("decoding", "async");
		await expect(image).toHaveAttribute("sizes", /\S+/);
		await expect(page.locator('img[fetchpriority="high"]')).toHaveCount(1);
		await expect(page.locator("main img")).toHaveCount(1);
		await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(
			0,
		);
	});

	test("renders one real semantic gallery-directory row without hero-only fields", async ({
		page,
	}) => {
		const section = directory(page);
		const rows = directoryRows(page);
		await expect(section).toHaveAttribute(
			"aria-labelledby",
			"gallery-directory-title",
		);
		await expect(section.locator("#gallery-directory-title")).toHaveText(
			HOME.directory.heading,
		);
		await expect(section.locator(":scope > ul.gallery-directory")).toHaveCount(
			1,
		);
		await expect(rows).toHaveCount(1);
		await expect(rows.first().locator(":scope > a")).toHaveAttribute(
			"href",
			HOME.directory.href,
		);
		await expect(rows.first().locator("h3")).toHaveText(HOME.directory.title);
		await expect(rows.first().locator("time")).toHaveText(HOME.directory.year);
		await expect(rows.first().locator("time")).toHaveAttribute(
			"datetime",
			HOME.directory.year,
		);
		await expect(rows.first()).toContainText(HOME.directory.count);
		await expect(rows.first().locator('[aria-hidden="true"]')).toHaveText("→");

		const directoryText = await section.innerText();
		expect(directoryText).not.toContain(HOME.featured.location);
		expect(directoryText).not.toContain(HOME.featured.publication);
		await expect(section.locator("img, picture")).toHaveCount(0);
	});

	test("keeps secondary and legal navigation in the footer only", async ({
		page,
	}) => {
		const header = siteHeader(page);
		const footer = siteFooter(page);
		const headerLinks = await header.locator("a").evaluateAll((links) =>
			links.map((link) => ({
				href: link.getAttribute("href"),
				label: link.textContent?.trim(),
			})),
		);
		expect(headerLinks).toEqual(HOME.headerLinks);
		await expect(
			header.getByRole("link", { name: HOME.identity, exact: true }),
		).toHaveAttribute("aria-current", "page");
		await expect(
			header.getByRole("link", { name: "Galleries", exact: true }),
		).not.toHaveAttribute("aria-current");

		for (const link of HOME.footerLinks) {
			await expect(
				footer.getByRole("link", { name: link.label, exact: true }),
			).toHaveAttribute("href", link.href);
			await expect(
				header.getByRole("link", { name: link.label, exact: true }),
			).toHaveCount(0);
		}
		await expect(footer.getByRole("link")).toHaveCount(HOME.footerLinks.length);
		await expect(page.getByRole("link", { name: /shop/i })).toHaveCount(0);
	});

	test("publishes deterministic ownership and build identity", async ({
		page,
	}) => {
		const footer = siteFooter(page);
		await expect(footer).toContainText(
			"© 2026 Ross Todd. All rights reserved.",
		);
		await expect(footer.locator("dl.site-footer__build > div")).toHaveCount(2);
		await expect(footer.getByText("Build", { exact: true })).toHaveCount(1);
		await expect(footer.getByText("Content", { exact: true })).toHaveCount(1);

		const values = await footer
			.locator("dl.site-footer__build dd")
			.allTextContents();
		expect(values[0]).toMatch(/^[a-f0-9]{7}$/);
		expect(values[1]?.trim().length).toBeGreaterThan(0);
		expect(
			await page.locator('meta[name="iso-zero-build"]').getAttribute("content"),
		).toMatch(/^[a-f0-9]{40}$/);
		expect(
			(
				await page
					.locator('meta[name="iso-zero-content"]')
					.getAttribute("content")
			)?.trim().length,
		).toBeGreaterThan(0);
	});

	test("emits the complete homepage metadata contract", async ({ page }) => {
		await expect(page).toHaveTitle(HOME.title);
		await expect(page.locator('meta[charset="UTF-8"]')).toHaveCount(1);
		await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
			"content",
			/width=device-width/,
		);
		await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute(
			"content",
			"dark",
		);
		await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
			"content",
			"#191611",
		);

		const description = await page
			.locator('meta[name="description"]')
			.getAttribute("content");
		expect(description?.trim().length).toBeGreaterThan(0);
		await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
			"content",
			HOME.title,
		);
		await expect(
			page.locator('meta[property="og:description"]'),
		).toHaveAttribute("content", description ?? "");
		await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
			"content",
			"website",
		);

		const canonical = await page
			.locator('link[rel="canonical"]')
			.getAttribute("href");
		const ogUrl = await page
			.locator('meta[property="og:url"]')
			.getAttribute("content");
		expect(canonical).not.toBeNull();
		expect(ogUrl).toBe(canonical);
		const canonicalUrl = new URL(canonical ?? "");
		expect(canonicalUrl.protocol).toBe("https:");
		expect(canonicalUrl.pathname).toBe("/");
		expect(canonicalUrl.search).toBe("");
		expect(canonicalUrl.hash).toBe("");

		await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
			"content",
			"summary_large_image",
		);
		for (const selector of [
			'meta[property="og:image"]',
			'meta[name="twitter:image"]',
		]) {
			const value = await page.locator(selector).getAttribute("content");
			expect(new URL(value ?? "").protocol).toBe("https:");
		}
	});

	test("aligns every major region to the shared Datum wide container", async ({
		page,
	}) => {
		await expectSharedInlineOrigin(page);
		const widths = await Promise.all(
			[siteHeader(page), identity(page), featured(page), directory(page)].map(
				(locator) =>
					locator.evaluate((element) => element.getBoundingClientRect().width),
			),
		);
		for (const width of widths) expect(width).toBeLessThanOrEqual(1400.5);
	});

	test("uses one persistent homepage accent datum and no competing controls", async ({
		page,
	}) => {
		const marks = await persistentAccentMarks(page);
		expect(marks).toHaveLength(1);
		expect(marks[0]).toEqual({
			element: expect.stringContaining("rule-datum"),
			pseudo: "::before",
		});
		await expect(
			page.locator("button, form, input, select, textarea, [role=button]"),
		).toHaveCount(0);
		await expect(page.locator("[style*='background-image']")).toHaveCount(0);
	});

	test("resolves every homepage destination and emits no client behavior", async ({
		page,
		request,
	}) => {
		const hrefs = [
			...HOME.headerLinks,
			{ label: HOME.featured.action, href: HOME.featured.href },
			{ label: HOME.directory.title, href: HOME.directory.href },
			...HOME.footerLinks,
		].map(({ href }) => href);

		for (const href of new Set(hrefs)) {
			const response = await request.get(new URL(href, page.url()).href);
			expect(response.ok(), `Expected ${href} to resolve`).toBe(true);
		}

		await expect(page.locator("script, astro-island, astro-slot")).toHaveCount(
			0,
		);
		const clientBehavior = await page
			.locator("body *")
			.evaluateAll((elements) =>
				elements.flatMap((element) =>
					[...element.attributes]
						.filter(
							(attribute) =>
								/^on/i.test(attribute.name) ||
								attribute.name.startsWith("client:"),
						)
						.map((attribute) => `${element.tagName}:${attribute.name}`),
				),
			);
		expect(clientBehavior).toEqual([]);
	});
});
