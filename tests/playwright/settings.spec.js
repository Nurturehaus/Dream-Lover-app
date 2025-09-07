import { test, expect } from '@playwright/test';

test.describe('Settings Screen Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for it to load
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    // Navigate to settings screen (assuming there's a tab or navigation)
    // This might need to be adjusted based on the actual navigation structure
    try {
      await page.click('[data-testid="settings-tab"]', { timeout: 5000 });
    } catch (error) {
      // If settings tab doesn't exist, try other ways to navigate
      console.log('Settings tab not found, trying alternative navigation');
    }
    
    // Wait for settings screen to be visible
    await page.waitForSelector('[data-testid="settings-screen"]', { timeout: 10000 });
  });

  test('should display settings screen correctly', async ({ page }) => {
    // Check that the settings screen is displayed
    await expect(page.locator('[data-testid="settings-screen"]')).toBeVisible();
    
    // Check that the header is displayed
    await expect(page.locator('text=Settings')).toBeVisible();
    
    // Check that main sections are present
    await expect(page.locator('text=Notifications')).toBeVisible();
    await expect(page.locator('text=Cycle Settings')).toBeVisible();
    await expect(page.locator('text=Partners')).toBeVisible();
  });

  test('should handle sign out functionality', async ({ page }) => {
    // Find and click the sign out button
    const signOutButton = page.locator('text=Sign Out');
    await expect(signOutButton).toBeVisible();
    await signOutButton.click();
    
    // Check that confirmation dialog appears
    await expect(page.locator('text=Are you sure you want to sign out?')).toBeVisible();
    
    // Click cancel first to test cancel functionality
    await page.click('text=Cancel');
    
    // Confirm we're still on settings screen
    await expect(page.locator('[data-testid="settings-screen"]')).toBeVisible();
    
    // Now test actual sign out
    await signOutButton.click();
    await page.click('text=Sign Out');
    
    // Should navigate to auth screen or show loading
    // Note: This might need adjustment based on actual navigation behavior
    await page.waitForTimeout(2000); // Give time for navigation
  });

  test('should open and handle partner invite modal', async ({ page }) => {
    // Find the add partner button (plus icon)
    const addPartnerButton = page.locator('[data-testid="add-partner-button"]').or(
      page.locator('text=+ >> visible=true').first()
    );
    
    if (await addPartnerButton.count() > 0) {
      await addPartnerButton.click();
    } else {
      // Alternative: look for "Generate Invite Link" button
      await page.click('text=Generate Invite Link');
    }
    
    // Check that the invite modal is displayed
    await expect(page.locator('text=Invite Partner')).toBeVisible();
    await expect(page.locator('text=Enter your partner\'s details')).toBeVisible();
    
    // Check that input fields are present
    await expect(page.locator('[data-testid="partner-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="partner-email-input"]')).toBeVisible();
    
    // Test form validation - try to send invite without filling fields
    await page.click('[data-testid="send-invite-button"]');
    
    // Should show error message
    await expect(page.locator('text=Please enter both name and email')).toBeVisible();
    
    // Fill in the form
    await page.fill('[data-testid="partner-name-input"]', 'Test Partner');
    await page.fill('[data-testid="partner-email-input"]', 'partner@test.com');
    
    // Send the invite
    await page.click('[data-testid="send-invite-button"]');
    
    // Check success message
    await expect(page.locator('text=Invite Sent!')).toBeVisible();
    
    // Close the success dialog
    await page.click('text=OK');
    
    // Modal should be closed
    await expect(page.locator('text=Invite Partner')).not.toBeVisible();
  });

  test('should handle partner management', async ({ page }) => {
    // Check if there are any existing partners to click on
    const partnerElements = page.locator('[data-testid^="partner-"]');
    const partnerCount = await partnerElements.count();
    
    if (partnerCount > 0) {
      // Click on the first partner
      await partnerElements.first().click();
      
      // Check that partner management modal opens
      await expect(page.locator('text=Manage Partner')).toBeVisible();
      
      // Check that partner details are displayed
      await expect(page.locator('text=Name:')).toBeVisible();
      await expect(page.locator('text=Connected:')).toBeVisible();
      await expect(page.locator('text=Partner Code:')).toBeVisible();
      
      // Test close functionality
      await page.click('text=Close');
      await expect(page.locator('text=Manage Partner')).not.toBeVisible();
      
      // Re-open and test delete functionality
      await partnerElements.first().click();
      await expect(page.locator('text=Manage Partner')).toBeVisible();
      
      // Click remove partner button
      await page.click('[data-testid="delete-partner-button"]');
      
      // Confirm deletion dialog appears
      await expect(page.locator('text=Remove Partner')).toBeVisible();
      await expect(page.locator('text=Are you sure you want to remove this partner?')).toBeVisible();
      
      // Test cancel deletion
      await page.click('text=Cancel');
      await expect(page.locator('text=Remove Partner')).not.toBeVisible();
    } else {
      console.log('No partners found to test management functionality');
    }
  });

  test('should handle notification toggles', async ({ page }) => {
    // Find notification switches
    const periodAlertsSwitch = page.locator('text=Period Alerts').locator('..').locator('input[type="checkbox"], [role="switch"]');
    const dailyRemindersSwitch = page.locator('text=Daily Reminders').locator('..').locator('input[type="checkbox"], [role="switch"]');
    const giftSuggestionsSwitch = page.locator('text=Gift Suggestions').locator('..').locator('input[type="checkbox"], [role="switch"]');
    
    // Test toggling switches (check current state and toggle)
    if (await periodAlertsSwitch.count() > 0) {
      await periodAlertsSwitch.click();
      await page.waitForTimeout(500); // Allow for toggle animation
    }
    
    if (await dailyRemindersSwitch.count() > 0) {
      await dailyRemindersSwitch.click();
      await page.waitForTimeout(500);
    }
    
    if (await giftSuggestionsSwitch.count() > 0) {
      await giftSuggestionsSwitch.click();
      await page.waitForTimeout(500);
    }
  });

  test('should handle cycle settings navigation', async ({ page }) => {
    // Test cycle length setting
    const cycleLengthOption = page.locator('text=Cycle Length');
    if (await cycleLengthOption.count() > 0) {
      await cycleLengthOption.click();
      
      // Should show "coming soon" alert
      await expect(page.locator('text=Cycle Length feature coming soon')).toBeVisible();
      await page.click('text=OK');
    }
    
    // Test period duration setting
    const periodDurationOption = page.locator('text=Period Duration');
    if (await periodDurationOption.count() > 0) {
      await periodDurationOption.click();
      
      // Should show "coming soon" alert
      await expect(page.locator('text=Period Duration feature coming soon')).toBeVisible();
      await page.click('text=OK');
    }
    
    // Test luteal phase setting
    const lutealPhaseOption = page.locator('text=Luteal Phase');
    if (await lutealPhaseOption.count() > 0) {
      await lutealPhaseOption.click();
      
      // Should show "coming soon" alert
      await expect(page.locator('text=Luteal Phase feature coming soon')).toBeVisible();
      await page.click('text=OK');
    }
  });

  test('should handle profile editing', async ({ page }) => {
    // Find and click the edit profile button (pencil icon)
    const editButton = page.locator('[data-testid="edit-profile-button"]').or(
      page.locator('text=✏️').or(page.getByRole('button').filter({ hasText: 'edit' }))
    );
    
    if (await editButton.count() > 0) {
      await editButton.click();
      
      // Check that edit profile modal opens
      await expect(page.locator('text=Edit Profile')).toBeVisible();
      
      // Check that input fields are present and have values
      const nameInput = page.locator('input[placeholder="Name"]');
      const emailInput = page.locator('input[placeholder="Email"]');
      
      await expect(nameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
      
      // Test editing the name
      await nameInput.fill('Updated Name');
      await emailInput.fill('updated@email.com');
      
      // Save changes
      await page.click('text=Save');
      
      // Should show success message
      await expect(page.locator('text=Profile updated successfully')).toBeVisible();
      await page.click('text=OK');
      
      // Modal should be closed
      await expect(page.locator('text=Edit Profile')).not.toBeVisible();
      
      // Verify the name was updated in the UI
      await expect(page.locator('text=Updated Name')).toBeVisible();
    }
  });

  test('should handle menu items navigation', async ({ page }) => {
    const menuItems = [
      'Privacy & Security',
      'Export Data',
      'Help & Support',
      'About'
    ];
    
    for (const menuItem of menuItems) {
      const menuElement = page.locator(`text=${menuItem}`);
      if (await menuElement.count() > 0) {
        await menuElement.click();
        
        // Should show "coming soon" alert
        await expect(page.locator(`text=${menuItem} feature coming soon`)).toBeVisible();
        await page.click('text=OK');
      }
    }
  });
});

test.describe('Calendar Screen Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    // Navigate to calendar screen
    try {
      await page.click('[data-testid="calendar-tab"]', { timeout: 5000 });
    } catch (error) {
      console.log('Calendar tab not found, trying alternative navigation');
    }
    
    // Wait for calendar screen to be visible
    await page.waitForSelector('[data-testid="calendar-screen"]', { timeout: 10000 });
  });

  test('should display calendar with enhanced color coding', async ({ page }) => {
    // Check that calendar is displayed
    await expect(page.locator('[data-testid="calendar-screen"]')).toBeVisible();
    
    // Check that the legend is present with new items
    await expect(page.locator('text=Calendar Legend')).toBeVisible();
    await expect(page.locator('text=Period Start')).toBeVisible();
    await expect(page.locator('text=Period Days')).toBeVisible();
    await expect(page.locator('text=Follicular')).toBeVisible();
    await expect(page.locator('text=Peak Ovulation')).toBeVisible();
    await expect(page.locator('text=Fertile Window')).toBeVisible();
    await expect(page.locator('text=PMS Phase')).toBeVisible();
  });

  test('should handle Log Today button', async ({ page }) => {
    const logTodayButton = page.locator('[data-testid="log-today-button"]');
    
    if (await logTodayButton.count() > 0) {
      await logTodayButton.click();
      
      // Should navigate to log screen (might need adjustment based on actual navigation)
      await page.waitForTimeout(2000);
    }
  });

  test('should handle Adjust Dates button and modal', async ({ page }) => {
    const adjustDatesButton = page.locator('[data-testid="adjust-dates-button"]');
    
    if (await adjustDatesButton.count() > 0) {
      await adjustDatesButton.click();
      
      // Check that adjust dates modal opens
      await expect(page.locator('text=Adjust Cycle Dates')).toBeVisible();
      await expect(page.locator('text=Update your period start date and cycle information')).toBeVisible();
      
      // Check that adjustment options are present
      await expect(page.locator('text=Last Period Start Date')).toBeVisible();
      await expect(page.locator('text=Period Duration')).toBeVisible();
      await expect(page.locator('text=Cycle Length')).toBeVisible();
      
      // Test close functionality
      await page.click('text=Close');
      await expect(page.locator('text=Adjust Cycle Dates')).not.toBeVisible();
      
      // Re-open and test save functionality
      await adjustDatesButton.click();
      await page.click('[data-testid="save-adjustments-button"]');
      
      // Should show coming soon message
      await expect(page.locator('text=Date adjustment features will be available soon!')).toBeVisible();
      await page.click('text=OK');
      
      // Modal should close
      await expect(page.locator('text=Adjust Cycle Dates')).not.toBeVisible();
    }
  });
});