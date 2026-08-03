import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
	contrastRatio,
	cssTokenAsColor,
	directory,
	directoryRows,
	featured,
	gotoHomepage,
	HOME,
	main,
	siteFooter,
	siteHeader,
	skipLink,
} from "./support/homepage";

test.describe("ISO Null homepage accessibility", () => {
	test.beforeEach(async ({ page }) => {
		await gotoHomepage(page);
	});

	test("has no WCAG 2.2 A or AA axe violations", async ({ page }) => {
		const results = await new AxeBuilder({ page })
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

	test("exposes the governed landmarks, labelled sections, and list relationships", async ({
		page,
	}) => {
		await expect(page.getByRole("banner")).toHaveCount(1);
		await expect(page.getByRole("main")).toHaveCount(1);
		await expect(page.getByRole("contentinfo")).toHaveCount(1);
		await expect(
			page.getByRole("navigation", { name: "Primary navigation", exact: true }),
		).toHaveCount(1);
		await expect(
			page.getByRole("navigation", { name: "Project", exact: true }),
		).toHaveCount(1);
		await expect(
			page.getByRole("navigation", { name: "Legal", exact: true }),
		).toHaveCount(1);
		await expect(
			page.getByRole("region", { name: HOME.identity, exact: true }),
		).toHaveCount(1);
		await expect(
			page.getByRole("region", {
				name: HOME.directory.heading,
				exact: true,
			}),
		).toHaveCount(1);
		await expect(directory(page).getByRole("list")).toHaveCount(1);
		await expect(directory(page).getByRole("listitem")).toHaveCount(1);
		await expect(siteHeader(page).getByRole("list")).toHaveCount(1);
		await expect(siteFooter(page).getByRole("list")).toHaveCount(2);
	});

	test("assembles clear feature and directory link names without announcing arrows", async ({
		page,
	}) => {
		const feature = page.getByRole("link", {
			name: "Enter gallery Venice",
			exact: true,
		});
		await expect(feature).toHaveCount(1);
		await expect(feature).toHaveAccessibleDescription(
			`${HOME.featured.alt} ${HOME.featured.location} ${HOME.featured.publication} ${HOME.featured.count}`,
		);
		await expect(
			page.getByRole("link", {
				name: `${HOME.directory.title} ${HOME.directory.year} ${HOME.directory.count}`,
				exact: true,
			}),
		).toHaveCount(1);
		await expect(page.locator('[aria-hidden="true"]')).toHaveCount(2);
		for (const arrow of await page.locator('[aria-hidden="true"]').all()) {
			await expect(arrow).toHaveText("→");
		}
	});

	test("makes the skip link first, reveals it on focus, and moves to main natively", async ({
		page,
	}) => {
		const firstFocusable = await page.evaluate(() => {
			const selector =
				'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
			return document.querySelector<HTMLElement>(selector)?.outerHTML ?? "";
		});
		expect(firstFocusable).toContain('class="skip-link"');
		await expect(skipLink(page)).toHaveText("Skip to content");
		await expect(skipLink(page)).toHaveAttribute("href", "#main");
		await expect(main(page)).toHaveAttribute("tabindex", "-1");

		await page.keyboard.press("Tab");
		await expect(skipLink(page)).toBeFocused();
		await expect(skipLink(page)).toBeInViewport();
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/#main$/);
		await expect(main(page)).toBeFocused();
	});

	test("keeps the complete link focus order equal to document order", async ({
		page,
	}) => {
		await page.reload({ waitUntil: "networkidle" });
		const expectedHrefs = [
			"#main",
			"/",
			"/galleries/",
			HOME.featured.href,
			HOME.directory.href,
			...HOME.footerLinks.map(({ href }) => href),
		];
		const observedHrefs: string[] = [];

		for (let index = 0; index < expectedHrefs.length; index += 1) {
			await page.keyboard.press("Tab");
			observedHrefs.push(
				await page.evaluate(
					() => document.activeElement?.getAttribute("href") ?? "",
				),
			);
		}
		expect(observedHrefs).toEqual(expectedHrefs);
	});

	test("meets the project 44 by 44 CSS-pixel link target", async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 900 });
		await gotoHomepage(page);
		const failures = await page.locator("a[href]").evaluateAll((links) =>
			links.flatMap((link) => {
				const rect = link.getBoundingClientRect();
				return rect.width + 0.01 < 44 || rect.height + 0.01 < 44
					? [
							{
								height: rect.height,
								href: link.getAttribute("href"),
								text: link.textContent?.trim(),
								width: rect.width,
							},
						]
					: [];
			}),
		);
		expect(failures).toEqual([]);
	});

	test("keeps text contrast and non-colour link affordances", async ({
		page,
	}) => {
		const [background, text, muted] = await Promise.all([
			cssTokenAsColor(page, "--bg"),
			cssTokenAsColor(page, "--text"),
			cssTokenAsColor(page, "--text-muted"),
		]);
		expect(contrastRatio(text, background)).toBeGreaterThanOrEqual(7);
		expect(contrastRatio(muted, background)).toBeGreaterThanOrEqual(4.5);

		const undecorated = await page.locator("a[href]").evaluateAll((links) =>
			links.flatMap((link) => {
				const textNodes = [
					link,
					...link.querySelectorAll<HTMLElement>("*"),
				].filter((element) => element.textContent?.trim());
				const underlined = textNodes.some((element) =>
					getComputedStyle(element).textDecorationLine.includes("underline"),
				);
				return underlined
					? []
					: [
							{
								href: link.getAttribute("href"),
								text: link.textContent?.trim(),
							},
						];
			}),
		);
		expect(undecorated).toEqual([]);
	});

	test("uses one visible accent focus outline without clipping", async ({
		page,
	}) => {
		for (let index = 0; index < 4; index += 1) await page.keyboard.press("Tab");
		await expect(featured(page)).toBeFocused();

		const accent = await cssTokenAsColor(page, "--accent");
		const focus = await featured(page).evaluate((element) => {
			const style = getComputedStyle(element);
			return {
				color: style.outlineColor,
				offset: Number.parseFloat(style.outlineOffset),
				style: style.outlineStyle,
				width: Number.parseFloat(style.outlineWidth),
			};
		});
		expect(focus.color).toBe(accent);
		expect(focus.style).not.toBe("none");
		expect(focus.width).toBeGreaterThanOrEqual(2);
		expect(focus.offset).toBeGreaterThanOrEqual(2);

		const clippingAncestors = await featured(page).evaluate((element) => {
			const values: string[] = [];
			let ancestor = element.parentElement;
			while (ancestor) {
				values.push(getComputedStyle(ancestor).overflow);
				ancestor = ancestor.parentElement;
			}
			return values;
		});
		expect(clippingAncestors).not.toContain("hidden");
		expect(clippingAncestors).not.toContain("clip");
	});

	test("preserves headings, links, and focus in forced colours", async ({
		browserName,
		page,
	}) => {
		test.skip(
			browserName !== "chromium",
			"Forced-colours emulation is verified in Chromium.",
		);
		await page.emulateMedia({ forcedColors: "active" });
		await gotoHomepage(page);

		await expect(
			page.getByRole("heading", { level: 1, name: HOME.identity }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { level: 2, name: HOME.directory.heading }),
		).toBeVisible();
		await directoryRows(page).locator("a").focus();
		await page.keyboard.press("Shift+Tab");
		await page.keyboard.press("Tab");

		const style = await directoryRows(page)
			.locator("a")
			.evaluate((element) => {
				const computed = getComputedStyle(element);
				const title = element.querySelector("h3");
				return {
					outline: computed.outlineStyle,
					outlineWidth: Number.parseFloat(computed.outlineWidth),
					titleDecoration: title
						? getComputedStyle(title).textDecorationLine
						: "",
				};
			});
		expect(style.outline).not.toBe("none");
		expect(style.outlineWidth).toBeGreaterThanOrEqual(2);
		expect(style.titleDecoration).toContain("underline");
	});

	test("has unique IDs and valid accessible-reference targets", async ({
		page,
	}) => {
		const result = await page.evaluate(() => {
			const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map(
				(element) => element.id,
			);
			const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
			const missingReferences = [
				...document.querySelectorAll<HTMLElement>(
					"[aria-labelledby], [aria-describedby]",
				),
			].flatMap((element) =>
				["aria-labelledby", "aria-describedby"].flatMap((attribute) =>
					(element.getAttribute(attribute) ?? "")
						.split(/\s+/)
						.filter(Boolean)
						.filter((id) => !document.getElementById(id))
						.map((id) => ({ attribute, id, tag: element.tagName })),
				),
			);
			return { duplicateIds, missingReferences };
		});
		expect(result).toEqual({ duplicateIds: [], missingReferences: [] });
	});

	test("collapses the optional gallery-arrow motion under reduced motion", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await gotoHomepage(page);
		await featured(page).hover();
		const transform = await featured(page)
			.locator(".featured-gallery__arrow")
			.evaluate((element) => getComputedStyle(element).transform);
		expect(transform).toBe("none");
	});
});
