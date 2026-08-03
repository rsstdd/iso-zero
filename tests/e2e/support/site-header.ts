import { readdir } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";

export const HEADER_CONTRACT = {
  wordmark: { label: "ISO Null", href: "/" },
  primaryNavigationLabel: "Primary navigation",
  primaryLinks: [{ label: "Galleries", href: "/galleries/" }],
  forbiddenLabels: ["About", "Engineering case study", "Impressum", "Datenschutz", "AGB", "Shop"],
} as const;

export const ALL_HEADER_LINKS = [
  HEADER_CONTRACT.wordmark,
  ...HEADER_CONTRACT.primaryLinks,
] as const;

export function siteHeader(page: Page): Locator {
  return page.locator("header.site-header");
}

export function wordmark(page: Page): Locator {
  return siteHeader(page).getByRole("link", {
    name: HEADER_CONTRACT.wordmark.label,
    exact: true,
  });
}

export function galleriesLink(page: Page): Locator {
  return siteHeader(page).getByRole("link", {
    name: HEADER_CONTRACT.primaryLinks[0].label,
    exact: true,
  });
}

export async function gotoRoute(page: Page, route = "/"): Promise<void> {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Expected ${route} to produce a document response`).not.toBeNull();
}

export async function expectLinkTargetAtLeast(link: Locator, minimumCssPixels = 44): Promise<void> {
  const box = await link.boundingBox();
  expect(box, "Expected the Header link to have a rendered box").not.toBeNull();
  expect(box?.width).toBeGreaterThanOrEqual(minimumCssPixels);
  expect(box?.height).toBeGreaterThanOrEqual(minimumCssPixels);
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const measurements = await page.evaluate(() => ({
    documentClientWidth: document.documentElement.clientWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    headerClientWidth: document.querySelector<HTMLElement>("header.site-header")?.clientWidth ?? 0,
    headerScrollWidth: document.querySelector<HTMLElement>("header.site-header")?.scrollWidth ?? 0,
  }));

  expect(measurements.documentScrollWidth).toBeLessThanOrEqual(
    measurements.documentClientWidth + 1,
  );
  expect(measurements.headerScrollWidth).toBeLessThanOrEqual(measurements.headerClientWidth + 1);
}

export async function expectTextNotClipped(locator: Locator): Promise<void> {
  const metrics = await locator.evaluateAll((elements) =>
    elements.map((element) => {
      const htmlElement = element as HTMLElement;
      const style = getComputedStyle(htmlElement);
      return {
        clientHeight: htmlElement.clientHeight,
        clientWidth: htmlElement.clientWidth,
        overflow: style.overflow,
        scrollHeight: htmlElement.scrollHeight,
        scrollWidth: htmlElement.scrollWidth,
        textOverflow: style.textOverflow,
        whiteSpace: style.whiteSpace,
      };
    }),
  );

  for (const metric of metrics) {
    expect(metric.scrollWidth).toBeLessThanOrEqual(metric.clientWidth + 1);
    expect(metric.scrollHeight).toBeLessThanOrEqual(metric.clientHeight + 1);
    expect(metric.overflow).not.toBe("hidden");
    expect(metric.textOverflow).not.toBe("ellipsis");
    expect(metric.whiteSpace).not.toBe("nowrap");
  }
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

export function expectedCurrentState(route: string): {
  readonly galleries: "location" | "page" | null;
  readonly wordmark: "page" | null;
} {
  if (route === "/") return { galleries: null, wordmark: "page" };
  if (route === "/galleries/") return { galleries: "page", wordmark: null };
  if (/^\/galleries\/[^/]+\/$/.test(route)) {
    return { galleries: "location", wordmark: null };
  }
  return { galleries: null, wordmark: null };
}

export async function focusHeaderLinkWithKeyboard(page: Page, label: string): Promise<void> {
  const target = siteHeader(page).getByRole("link", { name: label, exact: true });
  await target.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(target).toBeFocused();
}

export async function nonColourLinkState(link: Locator): Promise<{
  readonly decorationLine: string;
  readonly decorationStyle: string;
  readonly decorationThickness: string;
  readonly fontWeight: string;
  readonly underlineOffset: string;
}> {
  return link.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      decorationLine: style.textDecorationLine,
      decorationStyle: style.textDecorationStyle,
      decorationThickness: style.textDecorationThickness,
      fontWeight: style.fontWeight,
      underlineOffset: style.textUnderlineOffset,
    };
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
