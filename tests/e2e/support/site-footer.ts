import { readdir } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";

export const FOOTER_CONTRACT = {
  projectLinks: [
    { label: "About", href: "/about/" },
    { label: "Engineering case study", href: "/case-study/" },
  ],
  legalLinks: [
    { label: "Impressum", href: "/impressum/" },
    { label: "Datenschutz", href: "/datenschutz/" },
    { label: "AGB", href: "/agb/" },
  ],
  buildTerms: ["Build", "Content"],
} as const;

export const ALL_FOOTER_LINKS = [
  ...FOOTER_CONTRACT.projectLinks,
  ...FOOTER_CONTRACT.legalLinks,
] as const;

export function siteFooter(page: Page): Locator {
  return page.locator("footer.site-footer");
}

export async function gotoRoute(page: Page, route = "/"): Promise<void> {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Expected ${route} to produce a document response`).not.toBeNull();
}

export async function expectLinkTargetAtLeast(link: Locator, minimumCssPixels = 44): Promise<void> {
  const box = await link.boundingBox();
  expect(box, "Expected the footer link to have a rendered box").not.toBeNull();
  expect(box?.width).toBeGreaterThanOrEqual(minimumCssPixels);
  expect(box?.height).toBeGreaterThanOrEqual(minimumCssPixels);
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const measurements = await page.evaluate(() => ({
    documentClientWidth: document.documentElement.clientWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    footerClientWidth: document.querySelector<HTMLElement>("footer.site-footer")?.clientWidth ?? 0,
    footerScrollWidth: document.querySelector<HTMLElement>("footer.site-footer")?.scrollWidth ?? 0,
  }));

  expect(measurements.documentScrollWidth).toBeLessThanOrEqual(
    measurements.documentClientWidth + 1,
  );
  expect(measurements.footerScrollWidth).toBeLessThanOrEqual(measurements.footerClientWidth + 1);
}

export async function cssTokenAsColor(page: Page, token: string): Promise<string> {
  return page.evaluate((customProperty) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${customProperty})`;
    probe.hidden = true;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
}

export async function discoverBuiltRoutes(
  distRoot = resolve(process.cwd(), "dist"),
): Promise<string[]> {
  const htmlFiles = await walkHtmlFiles(distRoot);
  if (htmlFiles.length === 0) {
    throw new Error(
      `No built HTML found under ${distRoot}. Run the Astro production build before Playwright.`,
    );
  }

  return htmlFiles
    .map((filePath) => htmlFileToRoute(distRoot, filePath))
    .sort((left, right) => {
      if (left === "/") return -1;
      if (right === "/") return 1;
      return left.localeCompare(right);
    });
}

async function walkHtmlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(directory, entry.name);
      if (entry.isDirectory()) return walkHtmlFiles(entryPath);
      if (entry.isFile() && entry.name.endsWith(".html")) return [entryPath];
      return [];
    }),
  );

  return nested.flat();
}

function htmlFileToRoute(distRoot: string, filePath: string): string {
  const portablePath = relative(distRoot, filePath).split(sep).join("/");

  if (portablePath === "index.html") return "/";
  if (portablePath.endsWith("/index.html")) {
    return `/${portablePath.slice(0, -"index.html".length)}`;
  }

  return `/${portablePath.slice(0, -".html".length)}`;
}

export async function footerOuterHtml(page: Page): Promise<string> {
  return siteFooter(page).evaluate((footer) => footer.outerHTML);
}

export async function focusFooterLinkWithKeyboard(page: Page, label: string): Promise<void> {
  const target = siteFooter(page).getByRole("link", { name: label, exact: true });
  await target.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(target).toBeFocused();
}
