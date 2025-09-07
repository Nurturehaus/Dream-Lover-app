import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class AuthPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectors
    this.selectors = {
      container: '[data-testid="auth-screen"], [testid="auth-screen"]',
      nameInput: '[data-testid="name-input"], input[placeholder="Full Name"]',
      emailInput: '[data-testid="email-input"], input[placeholder="Email"]',
      passwordInput: '[data-testid="password-input"], input[placeholder="Password"]',
      rememberMeCheckbox: '[data-testid="remember-me-checkbox"], text="Remember me"',
      submitButton: '[data-testid="submit-button"], button',
      toggleModeButton: '[data-testid="toggle-auth-mode-button"]',
      errorMessages: '.error-text, [class*="error"]',
    };
  }

  // Navigation
  async goto() {
    await this.page.goto('/');
    await this.waitForSelector(this.selectors.container);
  }

  // Form interactions
  async fillSignUpForm(userData) {
    if (await this.isVisible(this.selectors.nameInput)) {
      await this.fill(this.selectors.nameInput, userData.name);
    }
    await this.fill(this.selectors.emailInput, userData.email);
    await this.fill(this.selectors.passwordInput, userData.password);
  }

  async fillSignInForm(credentials) {
    await this.fill(this.selectors.emailInput, credentials.email);
    await this.fill(this.selectors.passwordInput, credentials.password);
  }

  async toggleRememberMe() {
    await this.click(this.selectors.rememberMeCheckbox);
  }

  async submitForm() {
    await this.click(this.selectors.submitButton);
  }

  async toggleAuthMode() {
    if (await this.isVisible(this.selectors.toggleModeButton)) {
      await this.click(this.selectors.toggleModeButton);
    }
  }

  // Validations
  async expectToBeOnAuthScreen() {
    await expect(this.page.locator(this.selectors.container)).toBeVisible();
  }

  async expectErrorMessage(message) {
    await expect(this.page.locator(this.selectors.errorMessages).filter({ hasText: message })).toBeVisible();
  }

  async expectSuccessfulLogin() {
    await this.waitForNavigation();
    await expect(this.page.locator(this.selectors.container)).not.toBeVisible();
  }

  // Helper methods
  async signUp(userData) {
    await this.goto();
    await this.fillSignUpForm(userData);
    await this.submitForm();
  }

  async signIn(credentials) {
    await this.goto();
    await this.fillSignInForm(credentials);
    await this.submitForm();
  }

  async isSignUpMode() {
    return await this.isVisible(this.selectors.nameInput);
  }

  async switchToSignUpMode() {
    if (!(await this.isSignUpMode())) {
      await this.toggleAuthMode();
    }
  }

  async switchToSignInMode() {
    if (await this.isSignUpMode()) {
      await this.toggleAuthMode();
    }
  }
}