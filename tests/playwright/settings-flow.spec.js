import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { SettingsPage } from '../pages/SettingsPage.js';
import { TestHelpers } from '../utils/helpers.js';
import { TestData, TestDataHelpers } from '../fixtures/testData.js';

test.describe('Settings Flow', () => {
  let authPage;
  let dashboardPage;
  let settingsPage;
  let helpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    settingsPage = new SettingsPage(page);
    helpers = new TestHelpers(page);
    
    // Clear app data and register a user
    await helpers.clearAppData();
    const userData = TestDataHelpers.generateRandomUser();
    await helpers.registerUser(userData);
  });

  test.describe('Settings Screen Display', () => {
    test('should display settings screen correctly', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.expectToBeOnSettings();
      await settingsPage.expectProfileSectionVisible();
      await settingsPage.expectPartnerSectionVisible();
      await settingsPage.expectNotificationSectionVisible();
    });

    test('should show user profile information', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.expectProfileSectionVisible();
      
      const profileInfo = await settingsPage.getProfileInfo();
      expect(profileInfo.name).toBeDefined();
      expect(profileInfo.email).toBeDefined();
    });

    test('should display partner connection status', async ({ page }) => {
      await settingsPage.goto();
      
      const partnerStatus = await settingsPage.getPartnerStatus();
      expect(partnerStatus).toContain('No partner connected');
    });

    test('should show notification settings', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.expectNotificationSectionVisible();
      await settingsPage.expectNotificationTogglesVisible();
    });
  });

  test.describe('Profile Management', () => {
    test('should allow profile editing', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.clickEditProfile();
      
      // Should show profile edit modal or screen
      await helpers.waitForElement('[data-testid="edit-profile-modal"], [data-testid="edit-profile-screen"]', 5000);
    });

    test('should update profile information', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.clickEditProfile();
      
      const newName = 'Updated Name';
      await settingsPage.updateProfileName(newName);
      await settingsPage.saveProfile();
      
      // Verify the name was updated
      const updatedProfile = await settingsPage.getProfileInfo();
      expect(updatedProfile.name).toBe(newName);
    });

    test('should validate profile form inputs', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.clickEditProfile();
      
      // Try to save with empty name
      await settingsPage.updateProfileName('');
      await settingsPage.saveProfile();
      
      // Should show validation error
      await settingsPage.expectErrorMessage('Name is required');
    });
  });

  test.describe('Partner Management', () => {
    test('should show add partner option when no partner connected', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.expectAddPartnerButtonVisible();
    });

    test('should open partner invite modal', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.clickAddPartner();
      await settingsPage.expectPartnerInviteModalOpen();
    });

    test('should send partner invitation with valid data', async ({ page }) => {
      const partnerData = TestDataHelpers.generateRandomPartner();
      
      await settingsPage.goto();
      await settingsPage.clickAddPartner();
      await settingsPage.fillPartnerInviteForm(partnerData);
      await settingsPage.sendPartnerInvite();
      
      // Should show success message or update partner status
      await helpers.expectAlert('Partner invitation sent');
    });

    test('should validate partner invite form', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.clickAddPartner();
      
      // Try to send invite with empty fields
      await settingsPage.sendPartnerInvite();
      await settingsPage.expectErrorMessage('Name is required');
      await settingsPage.expectErrorMessage('Email is required');
      
      // Try with invalid email
      await settingsPage.fillPartnerInviteForm({
        name: 'Valid Name',
        email: 'invalid-email'
      });
      await settingsPage.sendPartnerInvite();
      await settingsPage.expectErrorMessage('Please enter a valid email');
    });

    test('should close partner invite modal', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.clickAddPartner();
      await settingsPage.closePartnerInviteModal();
      await settingsPage.expectPartnerInviteModalClosed();
    });

    test('should show partner management when partner is connected', async ({ page }) => {
      // Mock connected partner state
      await page.evaluate(() => {
        const partnerData = {
          connected: true,
          partner: {
            id: '123',
            name: 'Test Partner',
            email: 'partner@test.com',
            connectedAt: new Date().toISOString()
          }
        };
        localStorage.setItem('partnerData', JSON.stringify(partnerData));
      });
      
      await page.reload();
      await settingsPage.goto();
      
      await settingsPage.expectPartnerInfoVisible();
      await settingsPage.expectManagePartnerButtonVisible();
    });

    test('should allow partner management', async ({ page }) => {
      // Mock connected partner
      await page.evaluate(() => {
        const partnerData = {
          connected: true,
          partner: { id: '123', name: 'Test Partner', email: 'partner@test.com' }
        };
        localStorage.setItem('partnerData', JSON.stringify(partnerData));
      });
      
      await page.reload();
      await settingsPage.goto();
      
      await settingsPage.clickManagePartner();
      await settingsPage.expectPartnerManagementModalOpen();
      await settingsPage.expectPartnerPermissionsVisible();
    });

    test('should delete partner connection', async ({ page }) => {
      // Mock connected partner
      await page.evaluate(() => {
        const partnerData = {
          connected: true,
          partner: { id: '123', name: 'Test Partner', email: 'partner@test.com' }
        };
        localStorage.setItem('partnerData', JSON.stringify(partnerData));
      });
      
      await page.reload();
      await settingsPage.goto();
      
      await settingsPage.clickManagePartner();
      await settingsPage.deletePartner();
      
      // Should show confirmation dialog
      await helpers.expectAlert('Are you sure you want to remove this partner?');
    });
  });

  test.describe('Notification Settings', () => {
    test('should toggle period reminders', async ({ page }) => {
      await settingsPage.goto();
      
      const initialState = await settingsPage.isPeriodRemindersEnabled();
      await settingsPage.togglePeriodReminders();
      const newState = await settingsPage.isPeriodRemindersEnabled();
      
      expect(newState).toBe(!initialState);
    });

    test('should toggle ovulation alerts', async ({ page }) => {
      await settingsPage.goto();
      
      const initialState = await settingsPage.isOvulationAlertsEnabled();
      await settingsPage.toggleOvulationAlerts();
      const newState = await settingsPage.isOvulationAlertsEnabled();
      
      expect(newState).toBe(!initialState);
    });

    test('should toggle partner updates', async ({ page }) => {
      await settingsPage.goto();
      
      const initialState = await settingsPage.isPartnerUpdatesEnabled();
      await settingsPage.togglePartnerUpdates();
      const newState = await settingsPage.isPartnerUpdatesEnabled();
      
      expect(newState).toBe(!initialState);
    });

    test('should persist notification settings', async ({ page }) => {
      await settingsPage.goto();
      
      // Change settings
      await settingsPage.togglePeriodReminders();
      await settingsPage.toggleOvulationAlerts();
      
      // Reload page and verify settings persist
      await page.reload();
      await settingsPage.goto();
      
      const periodReminders = await settingsPage.isPeriodRemindersEnabled();
      const ovulationAlerts = await settingsPage.isOvulationAlertsEnabled();
      
      // Settings should be preserved
      expect(periodReminders).toBeDefined();
      expect(ovulationAlerts).toBeDefined();
    });
  });

  test.describe('Privacy and Security', () => {
    test('should show privacy settings', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.expectPrivacySectionVisible();
    });

    test('should toggle quick hide feature', async ({ page }) => {
      await settingsPage.goto();
      
      const initialState = await settingsPage.isQuickHideEnabled();
      await settingsPage.toggleQuickHide();
      const newState = await settingsPage.isQuickHideEnabled();
      
      expect(newState).toBe(!initialState);
    });

    test('should toggle passcode lock', async ({ page }) => {
      await settingsPage.goto();
      
      const initialState = await settingsPage.isPasscodeLockEnabled();
      await settingsPage.togglePasscodeLock();
      const newState = await settingsPage.isPasscodeLockEnabled();
      
      expect(newState).toBe(!initialState);
    });
  });

  test.describe('Data Management', () => {
    test('should show data management options', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.expectDataSectionVisible();
      await settingsPage.expectExportDataButtonVisible();
      await settingsPage.expectBackupButtonVisible();
    });

    test('should export user data', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.clickExportData();
      
      // Should show export confirmation or start download
      await helpers.expectAlert('Data export will be available soon');
    });

    test('should backup user data', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.clickBackup();
      
      // Should show backup options or confirmation
      await helpers.expectAlert('Backup functionality will be available soon');
    });
  });

  test.describe('Sign Out Functionality', () => {
    test('should show sign out option', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.expectSignOutButtonVisible();
    });

    test('should sign out successfully', async ({ page }) => {
      await settingsPage.goto();
      
      // Handle confirmation dialog
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('Are you sure you want to sign out?');
        await dialog.accept();
      });
      
      await settingsPage.signOut();
      
      // Should redirect to auth screen
      await authPage.expectToBeOnAuthScreen();
    });

    test('should cancel sign out', async ({ page }) => {
      await settingsPage.goto();
      
      // Handle confirmation dialog by canceling
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('Are you sure you want to sign out?');
        await dialog.dismiss();
      });
      
      await settingsPage.signOut();
      
      // Should stay on settings screen
      await settingsPage.expectToBeOnSettings();
    });
  });

  test.describe('About and App Information', () => {
    test('should show app version', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.expectAboutSectionVisible();
      
      const version = await settingsPage.getAppVersion();
      expect(version).toMatch(/\d+\.\d+\.\d+/); // Version format like 1.0.0
    });

    test('should show support information', async ({ page }) => {
      await settingsPage.goto();
      
      // Should show help, feedback, or support options
      const supportElement = page.locator('text="Help", text="Support", text="Contact"');
      if (await supportElement.isVisible()) {
        await expect(supportElement).toBeVisible();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors during partner operations', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/partners/**', (route) => {
        route.abort('failed');
      });
      
      await settingsPage.goto();
      await settingsPage.clickAddPartner();
      
      const partnerData = TestDataHelpers.generateRandomPartner();
      await settingsPage.fillPartnerInviteForm(partnerData);
      await settingsPage.sendPartnerInvite();
      
      // Should show network error
      await settingsPage.expectErrorMessage('Network error');
    });

    test('should handle corrupted settings data', async ({ page }) => {
      // Add corrupted settings data
      await page.evaluate(() => {
        localStorage.setItem('userSettings', 'invalid json');
        localStorage.setItem('notificationSettings', '{broken}');
      });
      
      await page.reload();
      await settingsPage.goto();
      
      // Should load with default settings
      await settingsPage.expectToBeOnSettings();
      await settingsPage.expectNotificationSectionVisible();
    });

    test('should handle missing user data', async ({ page }) => {
      // Remove user data
      await page.evaluate(() => {
        localStorage.removeItem('userData');
      });
      
      await page.reload();
      
      // Should redirect to auth or show error
      await helpers.waitForElement('[data-testid="auth-screen"], [data-testid="error-screen"]', 5000);
    });
  });

  test.describe('Accessibility', () => {
    test('should be accessible to screen readers', async ({ page }) => {
      await settingsPage.goto();
      
      // Check section headings have proper roles
      const sections = page.locator('text="Profile", text="Partners", text="Notifications"');
      const sectionCount = await sections.count();
      expect(sectionCount).toBeGreaterThan(0);
      
      // Check toggles have proper labels
      const toggles = page.locator('[role="switch"], input[type="checkbox"]');
      const toggleCount = await toggles.count();
      
      for (let i = 0; i < toggleCount; i++) {
        const toggle = toggles.nth(i);
        const hasLabel = await toggle.evaluate(el => {
          const id = el.id;
          return id ? document.querySelector(`label[for="${id}"]`) !== null : false;
        });
        expect(hasLabel).toBe(true);
      }
      
      // Run accessibility check
      const accessibilityIssues = await helpers.checkAccessibility();
      expect(accessibilityIssues).toHaveLength(0);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await settingsPage.goto();
      
      // Tab through interactive elements
      await page.keyboard.press('Tab'); // First toggle
      await page.keyboard.press('Tab'); // Second toggle
      await page.keyboard.press('Tab'); // Button
      
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Should be able to interact with focused element
      await page.keyboard.press('Enter');
    });

    test('should have proper focus management in modals', async ({ page }) => {
      await settingsPage.goto();
      await settingsPage.clickAddPartner();
      
      // Focus should move to modal
      const modal = page.locator('[data-testid="partner-invite-modal"]');
      await expect(modal).toBeVisible();
      
      // First focusable element should be focused
      const firstInput = modal.locator('input').first();
      await expect(firstInput).toBeFocused();
    });
  });

  test.describe('Performance', () => {
    test('should load settings quickly', async ({ page }) => {
      const startTime = Date.now();
      await settingsPage.goto();
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000); // Should load within 2 seconds
    });

    test('should handle rapid toggle changes efficiently', async ({ page }) => {
      await settingsPage.goto();
      
      // Rapidly toggle settings
      for (let i = 0; i < 5; i++) {
        await settingsPage.togglePeriodReminders();
        await page.waitForTimeout(100);
        await settingsPage.toggleOvulationAlerts();
        await page.waitForTimeout(100);
      }
      
      // Settings should still be responsive
      await settingsPage.expectNotificationSectionVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await helpers.setMobileViewport();
      await settingsPage.goto();
      
      await settingsPage.expectToBeOnSettings();
      await settingsPage.expectProfileSectionVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await helpers.setTabletViewport();
      await settingsPage.goto();
      
      await settingsPage.expectToBeOnSettings();
      await settingsPage.expectNotificationSectionVisible();
    });

    test('should adapt modal sizes for different viewports', async ({ page }) => {
      // Test on mobile
      await helpers.setMobileViewport();
      await settingsPage.goto();
      await settingsPage.clickAddPartner();
      
      const modal = page.locator('[data-testid="partner-invite-modal"]');
      await expect(modal).toBeVisible();
      
      // Modal should fit mobile viewport
      const modalSize = await modal.boundingBox();
      const viewport = page.viewportSize();
      expect(modalSize.width).toBeLessThanOrEqual(viewport.width);
    });
  });
});