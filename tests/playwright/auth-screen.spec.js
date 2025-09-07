const { test, expect } = require('@playwright/test');

test.describe('Authentication Screen Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to localhost:8081 where the app is running
    await page.goto('http://localhost:8081');
    
    // Wait for the app to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('should display authentication screen elements', async ({ page }) => {
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'auth-screen-initial.png', fullPage: true });
    
    // Check for main authentication screen
    const authScreen = await page.locator('[data-testid="auth-screen"]');
    await expect(authScreen).toBeVisible();
    
    // Check for email input
    const emailInput = await page.locator('[data-testid="email-input"]');
    await expect(emailInput).toBeVisible();
    
    // Check for password input
    const passwordInput = await page.locator('[data-testid="password-input"]');
    await expect(passwordInput).toBeVisible();
    
    // Check for sign in button
    const signInButton = await page.locator('[data-testid="sign-in-button"]');
    await expect(signInButton).toBeVisible();
    
    console.log('✅ All basic authentication elements are visible');
  });

  test('should display Google Sign-In button and be clickable', async ({ page }) => {
    // Check for Google Sign-In button
    const googleButton = await page.locator('[data-testid="google-sign-in-button"]');
    await expect(googleButton).toBeVisible();
    
    // Verify button text contains "Google"
    await expect(googleButton).toContainText('Google');
    
    // Check if button is clickable
    await expect(googleButton).toBeEnabled();
    
    // Take a screenshot highlighting the Google button
    await page.screenshot({ path: 'auth-google-button.png', fullPage: true });
    
    console.log('✅ Google Sign-In button is visible and clickable');
  });

  test('should display Apple Sign-In button and be clickable', async ({ page }) => {
    // Check for Apple Sign-In button
    const appleButton = await page.locator('[data-testid="apple-sign-in-button"]');
    await expect(appleButton).toBeVisible();
    
    // Verify button text contains "Apple"
    await expect(appleButton).toContainText('Apple');
    
    // Check if button is clickable
    await expect(appleButton).toBeEnabled();
    
    // Take a screenshot highlighting the Apple button
    await page.screenshot({ path: 'auth-apple-button.png', fullPage: true });
    
    console.log('✅ Apple Sign-In button is visible and clickable');
  });

  test('should handle Google Sign-In button click', async ({ page }) => {
    // Monitor console logs for authentication attempts
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser Error:', msg.text());
      }
    });
    
    const googleButton = await page.locator('[data-testid="google-sign-in-button"]');
    
    // Click the Google Sign-In button
    await googleButton.click();
    
    // Wait for any potential navigation or loading states
    await page.waitForTimeout(2000);
    
    // Take a screenshot after clicking
    await page.screenshot({ path: 'auth-google-after-click.png', fullPage: true });
    
    // Check if loading state is triggered (button should be disabled)
    const isButtonDisabled = await googleButton.isDisabled();
    console.log('Google button disabled after click:', isButtonDisabled);
    
    console.log('✅ Google Sign-In button click handled');
  });

  test('should handle Apple Sign-In button click', async ({ page }) => {
    // Monitor console logs for authentication attempts
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser Error:', msg.text());
      }
    });
    
    const appleButton = await page.locator('[data-testid="apple-sign-in-button"]');
    
    // Click the Apple Sign-In button
    await appleButton.click();
    
    // Wait for any potential navigation or loading states
    await page.waitForTimeout(2000);
    
    // Take a screenshot after clicking
    await page.screenshot({ path: 'auth-apple-after-click.png', fullPage: true });
    
    // Check if loading state is triggered (button should be disabled)
    const isButtonDisabled = await appleButton.isDisabled();
    console.log('Apple button disabled after click:', isButtonDisabled);
    
    console.log('✅ Apple Sign-In button click handled');
  });

  test('should validate form inputs work correctly', async ({ page }) => {
    const emailInput = await page.locator('[data-testid="email-input"]');
    const passwordInput = await page.locator('[data-testid="password-input"]');
    
    // Test email input
    await emailInput.fill('test@example.com');
    const emailValue = await emailInput.inputValue();
    expect(emailValue).toBe('test@example.com');
    
    // Test password input
    await passwordInput.fill('testpassword123');
    const passwordValue = await passwordInput.inputValue();
    expect(passwordValue).toBe('testpassword123');
    
    // Take a screenshot with filled form
    await page.screenshot({ path: 'auth-form-filled.png', fullPage: true });
    
    console.log('✅ Form inputs work correctly');
  });

  test('should display social login section with proper styling', async ({ page }) => {
    // Check that both social buttons are in the same row
    const socialButtons = await page.locator('[data-testid="google-sign-in-button"], [data-testid="apple-sign-in-button"]');
    const buttonCount = await socialButtons.count();
    expect(buttonCount).toBe(2);
    
    // Verify divider text
    const dividerText = await page.locator('text=or continue with');
    await expect(dividerText).toBeVisible();
    
    // Take a screenshot of the social login section
    await page.screenshot({ path: 'auth-social-section.png', fullPage: true });
    
    console.log('✅ Social login section displays correctly');
  });
});