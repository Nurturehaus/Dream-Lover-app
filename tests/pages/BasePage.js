export class BasePage {
  constructor(page) {
    this.page = page;
    this.timeout = 10000;
  }

  // Common wait methods
  async waitForSelector(selector, options = {}) {
    return await this.page.waitForSelector(selector, { 
      timeout: this.timeout, 
      ...options 
    });
  }

  async waitForNavigation(options = {}) {
    return await this.page.waitForLoadState('networkidle', { 
      timeout: this.timeout, 
      ...options 
    });
  }

  // Common interaction methods
  async click(selector) {
    await this.waitForSelector(selector);
    await this.page.click(selector);
  }

  async fill(selector, value) {
    await this.waitForSelector(selector);
    await this.page.fill(selector, value);
  }

  async getText(selector) {
    await this.waitForSelector(selector);
    return await this.page.textContent(selector);
  }

  async isVisible(selector) {
    try {
      await this.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async isHidden(selector) {
    try {
      await this.page.waitForSelector(selector, { 
        state: 'hidden', 
        timeout: 5000 
      });
      return true;
    } catch {
      return false;
    }
  }

  // Navigation helpers
  async navigateToTab(tabName) {
    const tabSelector = `[data-testid="tab-${tabName.toLowerCase()}"]`;
    await this.click(tabSelector);
    await this.waitForNavigation();
  }

  // Alert handling
  async handleAlert(action = 'accept') {
    this.page.on('dialog', dialog => dialog[action]());
  }

  async expectAlert(expectedMessage) {
    return new Promise((resolve) => {
      this.page.once('dialog', dialog => {
        expect(dialog.message()).toBe(expectedMessage);
        dialog.accept();
        resolve();
      });
    });
  }

  // Screenshot utility
  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `test-results/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }
}