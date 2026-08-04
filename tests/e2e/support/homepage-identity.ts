import { expect, type Locator, type Page } from "@playwright/test";

export const HOMEPAGE_IDENTITY_CONTRACT = {
  title: "IS0 ZER0",
  byline: "Photography by Ross Todd",
  headingId: "page-title",
  followingHeadings: ["Featured gallery", "Available galleries"],
} as const;

export async function gotoIdentityFixture(page: Page): Promise<void> {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(
    response,
    "Expected the Homepage Identity fixture to produce a document response",
  ).not.toBeNull();
}

export function identity(page: Page): Locator {
  return page.locator("section.homepage-identity");
}

export function identityTitle(page: Page): Locator {
  return identity(page).getByRole("heading", {
    level: 1,
    name: HOMEPAGE_IDENTITY_CONTRACT.title,
    exact: true,
  });
}

export function identityByline(page: Page): Locator {
  return identity(page).locator(":scope > p");
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

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const measurements = await page.evaluate(() => {
    const component = document.querySelector<HTMLElement>(".homepage-identity");
    return {
      componentClientWidth: component?.clientWidth ?? 0,
      componentScrollWidth: component?.scrollWidth ?? 0,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
    };
  });

  expect(measurements.documentScrollWidth).toBeLessThanOrEqual(
    measurements.documentClientWidth + 1,
  );
  expect(measurements.componentScrollWidth).toBeLessThanOrEqual(
    measurements.componentClientWidth + 1,
  );
}

export async function expectTextNotTruncated(locator: Locator): Promise<void> {
  const metrics = await locator.locator("h1, p").evaluateAll((elements) =>
    elements.map((element) => {
      const htmlElement = element as HTMLElement;
      const style = getComputedStyle(htmlElement);
      return {
        clientHeight: htmlElement.clientHeight,
        clientWidth: htmlElement.clientWidth,
        lineClamp: style.getPropertyValue("-webkit-line-clamp"),
        maxHeight: style.maxHeight,
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
    expect(metric.clientHeight).toBeGreaterThan(0);
    expect(metric.scrollHeight).toBeGreaterThan(0);
    expect(metric.maxHeight).toBe("none");
    expect(metric.overflow).not.toBe("hidden");
    expect(metric.overflow).not.toBe("clip");
    expect(metric.textOverflow).not.toBe("ellipsis");
    expect(["", "none", "0"]).toContain(metric.lineClamp);
    expect(metric.whiteSpace).not.toBe("nowrap");
  }
}

export async function renderedTextLineCount(locator: Locator): Promise<number> {
  return locator.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const lines = Array.from(range.getClientRects()).filter(
      (rect) => rect.width > 0 && rect.height > 0,
    );
    return new Set(lines.map((rect) => Math.round(rect.top * 10) / 10)).size;
  });
}

export function contrastRatio(first: string, second: string): number {
  const firstLuminance = relativeLuminance(parseRgb(first));
  const secondLuminance = relativeLuminance(parseRgb(second));
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(value: string): readonly [number, number, number] {
  const channels = value
    .match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number);
  if (!channels || channels.length !== 3) {
    throw new TypeError(`Expected an RGB colour, received: ${value}`);
  }
  return channels as unknown as readonly [number, number, number];
}

function relativeLuminance(channels: readonly [number, number, number]): number {
  const linear = channels.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
