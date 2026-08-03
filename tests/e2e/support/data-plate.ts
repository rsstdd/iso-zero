import { expect, type Locator, type Page } from "@playwright/test";

export const DATA_PLATE_CONTRACT = {
  roots: ["DIV", "FIGCAPTION", "FOOTER"],
  defaultTerms: ["ISO", "Exposure", "Aperture"],
  defaultValues: ["100", "1/250 s", "f/2.8"],
  figureValues: ["Venice, Italy", "August 2026", "12 images"],
  footerTerms: ["Build", "Content"],
  footerValues: ["0a1b2c3", "2026.08"],
  longTerms: ["Archive identifier", "Location", "Sequence"],
  longValues: [
    "VENICE-ARCADE-2026-08-0000000000000000000000000000000000000001",
    "Fondamenta San Giorgio dei Schiavoni beside the receding stone arcade",
    "0007 of 0040",
  ],
} as const;

export async function gotoDataPlateFixture(page: Page): Promise<void> {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response, "Expected the Data Plate fixture to produce a document response").not.toBeNull();
}

export function allDataPlates(page: Page): Locator {
  return page.locator(".data-plate");
}

export function defaultPlate(page: Page): Locator {
  return page.locator('[data-fixture="default"] > .data-plate');
}

export function figurePlate(page: Page): Locator {
  return page.locator('[data-fixture="figcaption"] > figcaption.data-plate');
}

export function footerPlate(page: Page): Locator {
  return page.locator('[data-fixture="footer"] > footer.data-plate');
}

export function longPlate(page: Page): Locator {
  return page.locator('[data-fixture="long"] > .data-plate');
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

export async function expectNoHorizontalOverflow(page: Page, plate: Locator): Promise<void> {
  const pageMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  const plateMetrics = await plate.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));

  expect(pageMetrics.scrollWidth).toBeLessThanOrEqual(pageMetrics.clientWidth + 1);
  expect(plateMetrics.scrollWidth).toBeLessThanOrEqual(plateMetrics.clientWidth + 1);
}

export async function expectTextNotTruncated(plate: Locator): Promise<void> {
  const metrics = await plate.locator("dt, dd, span, time").evaluateAll((elements) =>
    elements.map((element) => {
      const htmlElement = element as HTMLElement;
      const style = getComputedStyle(htmlElement);
      return {
        clientHeight: htmlElement.clientHeight,
        clientWidth: htmlElement.clientWidth,
        lineClamp: style.getPropertyValue("-webkit-line-clamp"),
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
    expect(metric.overflow).not.toBe("clip");
    expect(metric.textOverflow).not.toBe("ellipsis");
    expect(["", "none", "0"]).toContain(metric.lineClamp);
    expect(metric.whiteSpace).not.toBe("nowrap");
  }
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
