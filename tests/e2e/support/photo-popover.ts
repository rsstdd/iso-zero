import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Fixture gallery for PhotoPopover coverage. `germany` is published
 * (`draft: false`), reachable at its natural `[slug].astro` route (unlike
 * `venice`, which a static placeholder page currently shadows — see
 * `src/pages/galleries/venice/index.astro`), and has exactly one photo, so
 * `previousId`/`nextId` are both null and no prev/next buttons render.
 */
export const GALLERY_ROUTE = "/galleries/germany/";
export const TRIGGER_ID = "p-germany-0";

export async function gotoGallery(page: Page): Promise<void> {
  const response = await page.goto(GALLERY_ROUTE, { waitUntil: "domcontentloaded" });
  expect(response, `Expected ${GALLERY_ROUTE} to produce a document response`).not.toBeNull();
}

export function gridTrigger(page: Page): Locator {
  return page.locator(`button[popovertarget="${TRIGGER_ID}"]:not(.photo-popover__close)`);
}

export function popover(page: Page): Locator {
  return page.locator(`#${TRIGGER_ID}`);
}

export function closeButton(page: Page): Locator {
  return popover(page).locator(".photo-popover__close");
}

/** True only while the popover is in the top layer and open. */
export async function isPopoverOpen(page: Page): Promise<boolean> {
  return popover(page).evaluate((element) => element.matches(":popover-open"));
}
