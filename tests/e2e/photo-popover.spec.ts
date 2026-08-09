import { expect, test } from "@playwright/test";
import {
  closeButton,
  gotoGallery,
  gridTrigger,
  isImageLoaded,
  isPopoverOpen,
  popover,
  popoverImage,
} from "./support/photo-popover";

/**
 * Regression coverage for the native `popover`/`popovertarget` viewer
 * described in 05_INTERACTION_AND_ACCESSIBILITY.md "The viewer". This guards
 * against a defect where `.photo-popover` set `display: flex` unconditionally
 * in CSS: an author-origin rule with no `:popover-open` condition beats the
 * UA stylesheet's `[popover]:not(:popover-open) { display: none }`
 * regardless of specificity, so the popover rendered fixed and full-viewport
 * at all times and neither the close button, Escape, nor backdrop click
 * could hide it.
 */
test.describe("PhotoPopover viewer", () => {
  test.beforeEach(async ({ page }) => {
    await gotoGallery(page);
  });

  test("is closed on load and does not obscure the page", async ({ page }) => {
    await expect(popover(page)).toHaveCount(1);
    expect(await isPopoverOpen(page)).toBe(false);
    await expect(popover(page)).toBeHidden();
    await expect(gridTrigger(page)).toBeVisible();
  });

  test("opens via the grid trigger with dialog semantics", async ({ page }) => {
    await gridTrigger(page).click();

    expect(await isPopoverOpen(page)).toBe(true);
    await expect(popover(page)).toBeVisible();
    await expect(popover(page)).toHaveAttribute("role", "dialog");
    await expect(popover(page)).toHaveAttribute("aria-label", /\S+/);
  });

  test("closes via the close button and restores focus to the trigger", async ({ page }) => {
    await gridTrigger(page).click();
    expect(await isPopoverOpen(page)).toBe(true);

    await closeButton(page).click();

    expect(await isPopoverOpen(page)).toBe(false);
    await expect(popover(page)).toBeHidden();
    await expect(gridTrigger(page)).toBeFocused();
  });

  test("closes on Escape and restores focus to the trigger", async ({ page }) => {
    await gridTrigger(page).click();
    expect(await isPopoverOpen(page)).toBe(true);

    await page.keyboard.press("Escape");

    expect(await isPopoverOpen(page)).toBe(false);
    await expect(popover(page)).toBeHidden();
    await expect(gridTrigger(page)).toBeFocused();
  });

  test("closes on backdrop click (light dismiss)", async ({ page }) => {
    await gridTrigger(page).click();
    expect(await isPopoverOpen(page)).toBe(true);

    // The popover panel is centred with margins, so a viewport corner is
    // reliably outside its box and inside the ::backdrop.
    await page.mouse.click(5, 5);

    expect(await isPopoverOpen(page)).toBe(false);
    await expect(popover(page)).toBeHidden();
  });
});

/**
 * Regression coverage for docs/02_component-specs/11_PHOTO_POPOVER.md §14:
 * the enlarged image previously used `loading="lazy"` while living inside a
 * `[popover]`, which is `display: none` until opened. Per the HTML
 * lazy-loading eligibility algorithm, that combination defers the fetch
 * until the popover actually opens, so the image only began downloading at
 * the moment a visitor clicked — the "takes a while to load" defect. The fix
 * is `loading="eager"` plus `fetchpriority="low"` (so the background fetch
 * doesn't compete with the grid thumbnails for bandwidth). Explicit
 * `width`/`height` on the compiled `<img>` already reserve the correct box
 * before any image byte arrives (see docs/03_CONTENT_ASSET_AND_METADATA_PIPELINE.md
 * "Zero layout shift"); the second test below guards that this holds
 * regardless of how the loading strategy changes in the future.
 */
test.describe("PhotoPopover image loading", () => {
  test.beforeEach(async ({ page }) => {
    await gotoGallery(page);
  });

  test("fetches the enlarged image eagerly, before the popover ever opens", async ({ page }) => {
    await page.waitForLoadState("load");

    expect(
      await isImageLoaded(page),
      'Expected the popover image to already be decoded before any interaction — loading="eager" is what makes this possible for an image inside a display:none [popover]',
    ).toBe(true);
    expect(await isPopoverOpen(page)).toBe(false);
  });

  test("does not lazy-load the enlarged image", async ({ page }) => {
    await expect(popoverImage(page)).toHaveAttribute("loading", "eager");
    await expect(popoverImage(page)).toHaveAttribute("fetchpriority", "low");
  });

  test("reserves the image's final box on open, regardless of load timing", async ({ page }) => {
    await gridTrigger(page).click();
    const panel = popover(page);
    const img = popoverImage(page);

    const panelBoxAtOpen = await panel.boundingBox();
    const imgBoxAtOpen = await img.boundingBox();
    expect(
      panelBoxAtOpen,
      "Expected the panel to have a laid-out box immediately on open",
    ).not.toBeNull();
    expect(
      imgBoxAtOpen,
      "Expected the image to have a laid-out box immediately on open",
    ).not.toBeNull();

    await img.evaluate((element) => {
      const image = element as HTMLImageElement;
      if (image.complete) return;
      return new Promise<void>((resolve) =>
        image.addEventListener("load", () => resolve(), { once: true }),
      );
    });

    expect(await panel.boundingBox()).toEqual(panelBoxAtOpen);
    expect(await img.boundingBox()).toEqual(imgBoxAtOpen);
  });
});
