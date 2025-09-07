import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { TestHelpers } from '../utils/helpers.js';
import { TestData, TestDataHelpers } from '../fixtures/testData.js';

test.describe('Authentication Flow', () => {
  let authPage;
  let dashboardPage;
  let helpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    helpers = new TestHelpers(page);
    
    // Clear app data before each test
    await helpers.clearAppData();
  });

  test.describe('Sign Up Flow', () => {
    test('should successfully sign up with valid data', async ({ page }) => {
      const userData = TestDataHelpers.generateRandomUser();
      
      await authPage.goto();
      await authPage.expectToBeOnAuthScreen();
      
      // Switch to sign up mode if not already
      await authPage.switchToSignUpMode();
      
      // Fill and submit form
      await authPage.fillSignUpForm(userData);
      await authPage.submitForm();
      
      // Should navigate to main app
      await authPage.expectSuccessfulLogin();
      await dashboardPage.expectToBeOnDashboard();
    });

    test('should show validation errors for invalid data', async ({ page }) => {
      await authPage.goto();
      await authPage.switchToSignUpMode();
      
      // Test empty fields
      await authPage.submitForm();
      await authPage.expectErrorMessage('Name is required');
      await authPage.expectErrorMessage('Email is required');
      await authPage.expectErrorMessage('Password is required');
      
      // Test invalid email
      await authPage.fillSignUpForm(TestData.users.invalid.invalidEmail);
      await authPage.submitForm();
      await authPage.expectErrorMessage('Please enter a valid email');
      
      // Test weak password
      await authPage.fillSignUpForm(TestData.users.invalid.weakPassword);
      await authPage.submitForm();
      await authPage.expectErrorMessage('Password must be at least 6 characters');
    });

    test('should prevent duplicate email registration', async ({ page }) => {
      const userData = TestDataHelpers.generateRandomUser();
      
      // First registration
      await authPage.goto();
      await authPage.switchToSignUpMode();
      await authPage.signUp(userData);
      await authPage.expectSuccessfulLogin();
      
      // Logout
      await helpers.logoutUser();
      
      // Try to register again with same email
      await authPage.goto();
      await authPage.switchToSignUpMode();
      await authPage.signUp(userData);
      await authPage.expectErrorMessage('Email already exists');
    });

    test('should toggle between sign up and sign in modes', async ({ page }) => {
      await authPage.goto();
      
      // Should start in sign in mode
      expect(await authPage.isSignUpMode()).toBe(false);
      
      // Switch to sign up mode
      await authPage.toggleAuthMode();
      expect(await authPage.isSignUpMode()).toBe(true);
      
      // Switch back to sign in mode
      await authPage.toggleAuthMode();
      expect(await authPage.isSignUpMode()).toBe(false);
    });
  });

  test.describe('Sign In Flow', () => {
    test('should successfully sign in with valid credentials', async ({ page }) => {
      // First create a user account
      const userData = TestDataHelpers.generateRandomUser();
      await helpers.registerUser(userData);
      await helpers.logoutUser();
      
      // Now sign in
      await authPage.goto();
      await authPage.switchToSignInMode();
      await authPage.signIn({
        email: userData.email,
        password: userData.password
      });
      
      await authPage.expectSuccessfulLogin();
      await dashboardPage.expectToBeOnDashboard();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await authPage.goto();
      await authPage.switchToSignInMode();
      
      await authPage.signIn({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });
      
      await authPage.expectErrorMessage('Invalid credentials');
    });

    test('should validate required fields', async ({ page }) => {
      await authPage.goto();
      await authPage.switchToSignInMode();
      
      // Try to submit empty form
      await authPage.submitForm();
      await authPage.expectErrorMessage('Email is required');
      await authPage.expectErrorMessage('Password is required');
      
      // Fill only email
      await authPage.fillSignInForm({
        email: 'test@example.com',
        password: ''
      });
      await authPage.submitForm();
      await authPage.expectErrorMessage('Password is required');
    });

    test('should remember user when remember me is checked', async ({ page }) => {
      // Create user account
      const userData = TestDataHelpers.generateRandomUser();
      await helpers.registerUser(userData);
      await helpers.logoutUser();
      
      // Sign in with remember me
      await authPage.goto();
      await authPage.switchToSignInMode();
      await authPage.fillSignInForm({
        email: userData.email,
        password: userData.password
      });
      await authPage.toggleRememberMe();
      await authPage.submitForm();
      
      await authPage.expectSuccessfulLogin();
      
      // Close and reopen app - should still be logged in
      await page.close();
      const newPage = await page.context().newPage();
      const newAuthPage = new AuthPage(newPage);
      const newDashboardPage = new DashboardPage(newPage);
      
      await newAuthPage.goto();
      await newDashboardPage.expectToBeOnDashboard();
    });
  });

  test.describe('Password Recovery', () => {
    test('should show forgot password option', async ({ page }) => {
      await authPage.goto();
      await authPage.switchToSignInMode();
      
      // Check if forgot password link exists
      const forgotPasswordLink = page.locator('text="Forgot Password?"');
      await expect(forgotPasswordLink).toBeVisible();
    });

    test('should handle password reset request', async ({ page }) => {
      await authPage.goto();
      await authPage.switchToSignInMode();
      
      const forgotPasswordLink = page.locator('text="Forgot Password?"');
      if (await forgotPasswordLink.isVisible()) {
        await forgotPasswordLink.click();
        
        // Should show password reset form or modal
        await expect(page.locator('text="Reset Password", text="Password Reset"')).toBeVisible();
      }
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      const userData = TestDataHelpers.generateRandomUser();
      await helpers.registerUser(userData);
      
      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be logged in
      await dashboardPage.expectToBeOnDashboard();
    });

    test('should handle session expiration gracefully', async ({ page }) => {
      const userData = TestDataHelpers.generateRandomUser();
      await helpers.registerUser(userData);
      
      // Simulate session expiration by clearing storage
      await page.evaluate(() => {
        localStorage.removeItem('userData');
        sessionStorage.clear();
      });
      
      // Navigate to protected route
      await page.goto('/dashboard');
      
      // Should redirect to auth
      await authPage.expectToBeOnAuthScreen();
    });

    test('should logout successfully', async ({ page }) => {
      const userData = TestDataHelpers.generateRandomUser();
      await helpers.registerUser(userData);
      
      // Navigate to settings and logout
      await dashboardPage.clickProfile();
      
      // Should be able to sign out
      const signOutButton = page.locator('text="Sign Out"');
      await expect(signOutButton).toBeVisible();
      
      await signOutButton.click();
      
      // Handle confirmation dialog
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Are you sure you want to sign out?');
        await dialog.accept();
      });
      
      // Should redirect to auth
      await helpers.waitForNavigation();
      await authPage.expectToBeOnAuthScreen();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors during authentication', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/auth/**', (route) => {
        route.abort('failed');
      });
      
      await authPage.goto();
      await authPage.switchToSignInMode();
      await authPage.signIn(TestData.users.valid.tracker);
      
      // Should show network error
      await authPage.expectErrorMessage('Network error');
    });

    test('should handle server errors gracefully', async ({ page }) => {
      // Mock server error
      await page.route('**/api/auth/**', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });
      
      await authPage.goto();
      await authPage.switchToSignInMode();
      await authPage.signIn(TestData.users.valid.tracker);
      
      // Should show server error
      await authPage.expectErrorMessage('Server error');
    });
  });

  test.describe('Accessibility', () => {
    test('should be accessible to screen readers', async ({ page }) => {
      await authPage.goto();
      
      // Check for proper labels and ARIA attributes
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Sign In")');
      
      // Check that form elements have proper labels
      await expect(emailInput).toHaveAttribute('placeholder', 'Email');
      await expect(passwordInput).toHaveAttribute('placeholder', 'Password');
      await expect(submitButton).toBeVisible();
      
      // Run basic accessibility checks
      const accessibilityIssues = await helpers.checkAccessibility();
      expect(accessibilityIssues).toHaveLength(0);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await authPage.goto();
      await authPage.switchToSignInMode();
      
      // Tab through form elements
      await page.keyboard.press('Tab'); // Email input
      await page.keyboard.type('test@example.com');
      
      await page.keyboard.press('Tab'); // Password input  
      await page.keyboard.type('password123');
      
      await page.keyboard.press('Tab'); // Remember me checkbox
      await page.keyboard.press('Space'); // Check remember me
      
      await page.keyboard.press('Tab'); // Submit button
      await page.keyboard.press('Enter'); // Submit form
      
      // Should attempt to submit the form
      await helpers.waitForElement('[class*="error"], [data-testid="dashboard-screen"]', 5000);
    });
  });
});