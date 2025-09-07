// @ts-check
const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/CareSync/);
});

test('displays main navigation', async ({ page }) => {
  await page.goto('/');

  // Expect the main navigation tabs to be visible
  await expect(page.locator('[data-testid="tab-home"]')).toBeVisible();
  await expect(page.locator('[data-testid="tab-calendar"]')).toBeVisible();
  await expect(page.locator('[data-testid="tab-log"]')).toBeVisible();
  await expect(page.locator('[data-testid="tab-insights"]')).toBeVisible();
  await expect(page.locator('[data-testid="tab-settings"]')).toBeVisible();
});