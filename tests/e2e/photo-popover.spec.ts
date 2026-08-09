import { expect, test } from "@playwright/test";
import {
  closeButton,
  gotoGallery,
  gridTrigger,
  isPopoverOpen,
  popover,
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
