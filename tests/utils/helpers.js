import { expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';

export class TestHelpers {
  constructor(page) {
    this.page = page;
    this.authPage = new AuthPage(page);
    this.dashboardPage = new DashboardPage(page);
  }

  // Authentication helpers
  async loginUser(credentials = null) {
    const defaultCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const creds = credentials || defaultCredentials;
    
    await this.authPage.goto();
    await this.authPage.switchToSignInMode();
    await this.authPage.signIn(creds);
    await this.authPage.expectSuccessfulLogin();
    
    // Wait for dashboard to load
    await this.dashboardPage.waitForDashboardToLoad();
  }

  async registerUser(userData = null) {
    const defaultUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = userData || defaultUserData;
    
    await this.authPage.goto();
    await this.authPage.switchToSignUpMode();
    await this.authPage.signUp(user);
    await this.authPage.expectSuccessfulLogin();
    
    // Wait for dashboard to load
    await this.dashboardPage.waitForDashboardToLoad();
    
    return user;
  }

  async logoutUser() {
    // Navigate to profile/settings and logout
    await this.dashboardPage.clickProfile();
    const settingsPage = new (await import('../pages/SettingsPage.js')).SettingsPage(this.page);
    await settingsPage.signOut();
  }

  // App state management
  async clearAppData() {
    // Clear localStorage and sessionStorage
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Clear cookies
    await this.page.context().clearCookies();
  }

  async resetToInitialState() {
    await this.clearAppData();
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  // Navigation helpers
  async waitForNavigation(timeout = 10000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  async waitForElement(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  // Modal helpers
  async handleAlert(expectedMessage, action = 'accept') {
    return new Promise((resolve) => {
      this.page.once('dialog', async (dialog) => {
        if (expectedMessage) {
          expect(dialog.message()).toContain(expectedMessage);
        }
        await dialog[action]();
        resolve();
      });
    });
  }

  async expectAlert(expectedMessage) {
    return this.handleAlert(expectedMessage, 'accept');
  }

  async dismissAlert() {
    return this.handleAlert(null, 'dismiss');
  }

  // Form helpers
  async fillFormField(selector, value) {
    await this.waitForElement(selector);
    await this.page.fill(selector, value);
  }

  async selectOption(selector, option) {
    await this.waitForElement(selector);
    await this.page.selectOption(selector, option);
  }

  async toggleCheckbox(selector, checked = true) {
    await this.waitForElement(selector);
    const checkbox = this.page.locator(selector);
    const isChecked = await checkbox.isChecked();
    
    if (checked && !isChecked) {
      await checkbox.check();
    } else if (!checked && isChecked) {
      await checkbox.uncheck();
    }
  }

  // Data validation helpers
  async expectElementVisible(selector, timeout = 10000) {
    await expect(this.page.locator(selector)).toBeVisible({ timeout });
  }

  async expectElementHidden(selector, timeout = 10000) {
    await expect(this.page.locator(selector)).toBeHidden({ timeout });
  }

  async expectElementText(selector, expectedText) {
    await expect(this.page.locator(selector)).toHaveText(expectedText);
  }

  async expectElementContainsText(selector, expectedText) {
    await expect(this.page.locator(selector)).toContainText(expectedText);
  }

  async expectElementCount(selector, expectedCount) {
    await expect(this.page.locator(selector)).toHaveCount(expectedCount);
  }

  // Screenshot helpers
  async takeScreenshot(name, options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    
    await this.page.screenshot({
      path: `test-results/screenshots/${filename}`,
      fullPage: true,
      ...options
    });
    
    return filename;
  }

  async compareScreenshot(name, options = {}) {
    await expect(this.page).toHaveScreenshot(`${name}.png`, options);
  }

  // Performance helpers
  async measurePageLoad() {
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    const endTime = Date.now();
    return endTime - startTime;
  }

  async waitForStableDOM(timeout = 5000) {
    // Wait for DOM to stop changing
    await this.page.waitForFunction(() => {
      return new Promise((resolve) => {
        let lastBodyHTML = document.body.innerHTML;
        setTimeout(() => {
          if (document.body.innerHTML === lastBodyHTML) {
            resolve(true);
          } else {
            resolve(false);
          }
        }, 500);
      });
    }, { timeout });
  }

  // Network helpers
  async mockAPIResponse(url, response) {
    await this.page.route(url, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  async interceptAPICall(url) {
    return new Promise((resolve) => {
      this.page.route(url, (route) => {
        resolve(route.request());
        route.continue();
      });
    });
  }

  // Tab management
  async switchToTab(tabIndex) {
    const pages = this.page.context().pages();
    if (pages[tabIndex]) {
      await pages[tabIndex].bringToFront();
      return pages[tabIndex];
    }
    return null;
  }

  async openNewTab() {
    const newPage = await this.page.context().newPage();
    return newPage;
  }

  // Device simulation
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  // Accessibility helpers
  async checkAccessibility() {
    // Basic accessibility checks
    const results = await this.page.evaluate(() => {
      const issues = [];
      
      // Check for missing alt text on images
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        issues.push(`${images.length} images missing alt text`);
      }
      
      // Check for form labels
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      inputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (!label && input.type !== 'hidden') {
          issues.push(`Input missing label: ${input.name || input.type}`);
        }
      });
      
      // Check for heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      headings.forEach(heading => {
        const currentLevel = parseInt(heading.tagName[1]);
        if (currentLevel > lastLevel + 1) {
          issues.push(`Heading hierarchy skip: ${heading.tagName} after h${lastLevel}`);
        }
        lastLevel = currentLevel;
      });
      
      return issues;
    });
    
    return results;
  }

  // Utility methods
  async generateRandomEmail() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `test-${timestamp}-${random}@example.com`;
  }

  async generateRandomString(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  async pause(milliseconds = 1000) {
    await this.page.waitForTimeout(milliseconds);
  }

  // Debug helpers
  async debugPause() {
    if (process.env.DEBUG === 'true') {
      await this.page.pause();
    }
  }

  async logPageErrors() {
    this.page.on('pageerror', (error) => {
      console.error('Page error:', error);
    });
    
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
  }
}