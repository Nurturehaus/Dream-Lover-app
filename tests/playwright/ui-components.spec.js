// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('CareSync UI Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Handle authentication if needed
    try {
      // Check if we're on auth screen and need to authenticate
      await page.waitForSelector('[data-testid="auth-screen"]', { timeout: 3000 });
      
      // Fill in sign up form if present
      const emailInput = page.locator('input[placeholder*="email"]');
      const passwordInput = page.locator('input[placeholder*="password"]');
      const nameInput = page.locator('input[placeholder*="name"]');
      
      if (await emailInput.isVisible()) {
        await nameInput.fill('Test User');
        await emailInput.fill('test@example.com');
        await passwordInput.fill('password123');
        
        // Click sign up/sign in button
        await page.click('button:has-text("Sign Up")');
        
        // Wait for dashboard to load
        await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
      }
    } catch (e) {
      // Auth screen not present or already authenticated
      console.log('No auth needed or already authenticated');
    }
  });

  test('dashboard screen loads correctly', async ({ page }) => {
    // Wait for the dashboard to load
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    
    // Check for main elements
    await expect(page.getByText('Dream Lover')).toBeVisible();
  });

  test('tab navigation works', async ({ page }) => {
    // Test each tab navigation
    await page.click('[data-testid="tab-calendar"]');
    await expect(page.locator('[data-testid="calendar-screen"]')).toBeVisible();

    await page.click('[data-testid="tab-log"]');
    await expect(page.locator('[data-testid="log-screen"]')).toBeVisible();

    await page.click('[data-testid="tab-insights"]');
    await expect(page.locator('[data-testid="insights-screen"]')).toBeVisible();

    await page.click('[data-testid="tab-settings"]');
    await expect(page.locator('[data-testid="settings-screen"]')).toBeVisible();

    await page.click('[data-testid="tab-home"]');
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
  });

  test('gradient buttons render correctly', async ({ page }) => {
    const buttons = page.locator('[data-testid^="gradient-button"]');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      await expect(button).toBeVisible();
      await expect(button).toHaveCSS('border-radius', /\d+px/);
    }
  });

  test('responsive design on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that navigation is still visible
    await expect(page.locator('[data-testid="tab-home"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-calendar"]')).toBeVisible();
    
    // Check that content adapts
    const container = page.locator('[data-testid="dashboard-container"]');
    await expect(container).toBeVisible();
  });
});