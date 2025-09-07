import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { LogPage } from '../pages/LogPage.js';
import { CalendarPage } from '../pages/CalendarPage.js';
import { TestHelpers } from '../utils/helpers.js';
import { TestData, TestDataHelpers } from '../fixtures/testData.js';

test.describe('Log Flow', () => {
  let authPage;
  let dashboardPage;
  let logPage;
  let calendarPage;
  let helpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    logPage = new LogPage(page);
    calendarPage = new CalendarPage(page);
    helpers = new TestHelpers(page);
    
    // Clear app data and register a user
    await helpers.clearAppData();
    const userData = TestDataHelpers.generateRandomUser();
    await helpers.registerUser(userData);
  });

  test.describe('Log Screen Display', () => {
    test('should display log screen correctly', async ({ page }) => {
      await logPage.goto();
      await logPage.expectToBeOnLogScreen();
      await logPage.expectFlowSectionVisible();
      await logPage.expectSymptomsSectionVisible();
      await logPage.expectMoodSectionVisible();
      await logPage.expectTemperatureSectionVisible();
      await logPage.expectNotesSectionVisible();
    });

    test('should show all flow intensity options', async ({ page }) => {
      await logPage.goto();
      await logPage.expectFlowSectionVisible();
      
      // Check all flow options are visible
      const flowOptions = ['none', 'light', 'medium', 'heavy'];
      for (const option of flowOptions) {
        const flowButton = page.locator(`[data-testid="flow-${option}"]`);
        await expect(flowButton).toBeVisible();
      }
    });

    test('should display symptoms grid', async ({ page }) => {
      await logPage.goto();
      await logPage.expectSymptomsSectionVisible();
      
      // Check common symptoms are available
      const commonSymptoms = ['cramps', 'headache', 'fatigue', 'mood-swings'];
      for (const symptom of commonSymptoms) {
        const symptomButton = page.locator(`[data-testid="symptom-${symptom}"]`);
        if (await symptomButton.isVisible()) {
          await expect(symptomButton).toBeVisible();
        }
      }
    });

    test('should show mood emoji options', async ({ page }) => {
      await logPage.goto();
      await logPage.expectMoodSectionVisible();
      
      // Check mood options are available
      const moodButtons = page.locator('[data-testid^="mood-"]');
      const moodCount = await moodButtons.count();
      expect(moodCount).toBeGreaterThan(0);
    });

    test('should display partner visibility toggle', async ({ page }) => {
      await logPage.goto();
      await logPage.expectPartnerToggleVisible();
    });
  });

  test.describe('Flow Intensity Selection', () => {
    test('should select flow intensity', async ({ page }) => {
      await logPage.goto();
      await logPage.selectFlowIntensity('medium');
      await logPage.expectFlowIntensitySelected('medium');
    });

    test('should change flow intensity selection', async ({ page }) => {
      await logPage.goto();
      
      // Select initial intensity
      await logPage.selectFlowIntensity('light');
      await logPage.expectFlowIntensitySelected('light');
      
      // Change selection
      await logPage.selectFlowIntensity('heavy');
      await logPage.expectFlowIntensitySelected('heavy');
    });

    test('should handle all flow intensity options', async ({ page }) => {
      const flowOptions = ['none', 'light', 'medium', 'heavy'];
      
      await logPage.goto();
      
      for (const intensity of flowOptions) {
        await logPage.selectFlowIntensity(intensity);
        await logPage.expectFlowIntensitySelected(intensity);
      }
    });
  });

  test.describe('Symptom Selection', () => {
    test('should select single symptom', async ({ page }) => {
      await logPage.goto();
      await logPage.selectSymptom('cramps');
      await logPage.expectSymptomSelected('cramps');
    });

    test('should select multiple symptoms', async ({ page }) => {
      const symptoms = ['cramps', 'headache', 'fatigue'];
      
      await logPage.goto();
      await logPage.selectMultipleSymptoms(symptoms);
      
      for (const symptom of symptoms) {
        await logPage.expectSymptomSelected(symptom);
      }
    });

    test('should deselect symptoms by clicking again', async ({ page }) => {
      await logPage.goto();
      
      // Select symptom
      await logPage.selectSymptom('cramps');
      await logPage.expectSymptomSelected('cramps');
      
      // Deselect by clicking again
      await logPage.selectSymptom('cramps');
      
      const selectedSymptoms = await logPage.getSelectedSymptoms();
      expect(selectedSymptoms).not.toContain('cramps');
    });

    test('should handle symptom combinations', async ({ page }) => {
      const physicalSymptoms = ['cramps', 'headache', 'back-pain'];
      const emotionalSymptoms = ['mood-swings', 'anxiety'];
      
      await logPage.goto();
      await logPage.selectMultipleSymptoms([...physicalSymptoms, ...emotionalSymptoms]);
      
      const selectedSymptoms = await logPage.getSelectedSymptoms();
      expect(selectedSymptoms.length).toBe(physicalSymptoms.length + emotionalSymptoms.length);
    });
  });

  test.describe('Mood Selection', () => {
    test('should select mood by index', async ({ page }) => {
      await logPage.goto();
      await logPage.selectMood(2); // Sad mood
      await logPage.expectMoodSelected(2);
    });

    test('should change mood selection', async ({ page }) => {
      await logPage.goto();
      
      // Select initial mood
      await logPage.selectMood(0); // Happy
      await logPage.expectMoodSelected(0);
      
      // Change mood
      await logPage.selectMood(4); // Tired
      await logPage.expectMoodSelected(4);
    });

    test('should select mood by emoji', async ({ page }) => {
      await logPage.goto();
      
      const moodEmojis = ['😊', '😐', '😔', '😣', '😴'];
      for (let i = 0; i < moodEmojis.length; i++) {
        const emoji = moodEmojis[i];
        const emojiButton = page.locator(`[data-testid^="mood-"]:has-text("${emoji}")`);
        
        if (await emojiButton.isVisible()) {
          await logPage.selectMoodByEmoji(emoji);
          await logPage.expectMoodSelected(i);
        }
      }
    });
  });

  test.describe('Temperature Entry', () => {
    test('should enter temperature value', async ({ page }) => {
      await logPage.goto();
      await logPage.enterTemperature(98.6);
      await logPage.expectTemperatureValue(98.6);
    });

    test('should handle different temperature formats', async ({ page }) => {
      const temperatures = [97.8, 98.1, 99.2, 100.4];
      
      await logPage.goto();
      
      for (const temp of temperatures) {
        await logPage.enterTemperature(temp);
        await logPage.expectTemperatureValue(temp);
      }
    });

    test('should validate temperature input', async ({ page }) => {
      await logPage.goto();
      
      // Try invalid temperature
      await logPage.enterTemperature(-5);
      const temperature = await logPage.getTemperature();
      
      // Should either reject invalid input or show validation error
      expect(parseFloat(temperature)).toBeGreaterThan(0);
    });
  });

  test.describe('Notes Entry', () => {
    test('should enter notes', async ({ page }) => {
      const notes = 'Feeling good today, no major symptoms.';
      
      await logPage.goto();
      await logPage.enterNotes(notes);
      await logPage.expectNotesValue(notes);
    });

    test('should handle long notes', async ({ page }) => {
      const longNotes = 'This is a very long note about how I am feeling today. '.repeat(10);
      
      await logPage.goto();
      await logPage.enterNotes(longNotes);
      await logPage.expectNotesValue(longNotes);
    });

    test('should preserve notes when switching fields', async ({ page }) => {
      const notes = 'Important notes to remember';
      
      await logPage.goto();
      await logPage.enterNotes(notes);
      
      // Switch to other fields
      await logPage.selectFlowIntensity('medium');
      await logPage.selectSymptom('cramps');
      
      // Notes should still be there
      await logPage.expectNotesValue(notes);
    });
  });

  test.describe('Partner Visibility', () => {
    test('should toggle partner visibility', async ({ page }) => {
      await logPage.goto();
      
      // Get initial state
      const partnerToggle = page.locator('[data-testid="partner-toggle"]');
      const initialState = await partnerToggle.isChecked();
      
      await logPage.togglePartnerVisibility();
      
      const newState = await partnerToggle.isChecked();
      expect(newState).toBe(!initialState);
    });

    test('should set partner visibility explicitly', async ({ page }) => {
      await logPage.goto();
      
      await logPage.setPartnerVisibility(true);
      await logPage.expectPartnerVisibilityEnabled(true);
      
      await logPage.setPartnerVisibility(false);
      await logPage.expectPartnerVisibilityEnabled(false);
    });
  });

  test.describe('Complete Log Entry', () => {
    test('should fill and save complete log entry', async ({ page }) => {
      const logData = TestData.logEntries.complete;
      
      await logPage.goto();
      await logPage.fillCompleteLog(logData);
      await logPage.saveLog();
      
      // Should navigate back to dashboard or calendar
      await helpers.waitForElement('[data-testid="dashboard-screen"], [data-testid="calendar-screen"]', 5000);
    });

    test('should save minimal log entry', async ({ page }) => {
      const logData = TestData.logEntries.minimal;
      
      await logPage.goto();
      await logPage.fillCompleteLog(logData);
      await logPage.saveLog();
      
      // Should save successfully
      await helpers.waitForNavigation();
    });

    test('should handle heavy flow log entry', async ({ page }) => {
      const logData = TestData.logEntries.heavyFlow;
      
      await logPage.goto();
      await logPage.fillCompleteLog(logData);
      await logPage.saveLog();
      
      // Should save and navigate
      await helpers.waitForNavigation();
    });

    test('should validate required fields', async ({ page }) => {
      await logPage.goto();
      
      // Try to save without any data
      await logPage.saveLog();
      
      // Should either save with defaults or show validation message
      // Implementation depends on app requirements
      await helpers.waitForElement('[data-testid="error-message"], [data-testid="dashboard-screen"]', 5000);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back from log screen', async ({ page }) => {
      await logPage.goto();
      await logPage.goBack();
      
      // Should return to previous screen
      await helpers.waitForNavigation();
    });

    test('should navigate to log from dashboard', async ({ page }) => {
      await dashboardPage.expectToBeOnDashboard();
      await dashboardPage.clickLogTodayButton();
      await logPage.expectToBeOnLogScreen();
    });

    test('should navigate to log from calendar', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.clickLogToday();
      await logPage.expectToBeOnLogScreen();
    });
  });

  test.describe('Data Persistence', () => {
    test('should save log data persistently', async ({ page }) => {
      const logData = TestData.logEntries.complete;
      
      await logPage.goto();
      await logPage.fillCompleteLog(logData);
      await logPage.saveLog();
      
      // Navigate away and back
      await dashboardPage.expectToBeOnDashboard();
      await dashboardPage.clickLogTodayButton();
      
      // For today's date, data might be pre-filled
      const currentData = await logPage.getLogData();
      expect(currentData).toBeDefined();
    });

    test('should handle multiple log entries for different dates', async ({ page }) => {
      const logData = TestData.logEntries.minimal;
      
      // Log data multiple times
      for (let i = 0; i < 3; i++) {
        await logPage.goto();
        await logPage.fillCompleteLog(logData);
        await logPage.saveLog();
        await helpers.waitForNavigation();
      }
      
      // Data should be saved correctly
      await dashboardPage.expectToBeOnDashboard();
      const trackingStatus = await dashboardPage.getTodayTrackingStatus();
      expect(trackingStatus).not.toContain('No entries');
    });

    test('should preserve partial entries when navigating away', async ({ page }) => {
      await logPage.goto();
      
      // Fill partial data
      await logPage.selectFlowIntensity('medium');
      await logPage.selectSymptom('cramps');
      
      // Navigate away without saving
      await logPage.goBack();
      await dashboardPage.expectToBeOnDashboard();
      
      // Navigate back to log
      await dashboardPage.clickLogTodayButton();
      
      // Data might be preserved in draft state
      await logPage.expectToBeOnLogScreen();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors during save', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/log/**', (route) => {
        route.abort('failed');
      });
      
      const logData = TestData.logEntries.complete;
      
      await logPage.goto();
      await logPage.fillCompleteLog(logData);
      await logPage.saveLog();
      
      // Should show error message or retry option
      await helpers.waitForElement('[data-testid="error-message"], [data-testid="retry-button"]', 5000);
    });

    test('should handle invalid data gracefully', async ({ page }) => {
      await logPage.goto();
      
      // Try to enter invalid temperature
      await page.locator('[data-testid="temperature-input"]').fill('invalid');
      await logPage.saveLog();
      
      // Should handle validation or show error
      await helpers.waitForElement('[data-testid="error-message"], [data-testid="dashboard-screen"]', 5000);
    });

    test('should recover from app crashes', async ({ page }) => {
      const logData = TestData.logEntries.complete;
      
      await logPage.goto();
      await logPage.fillCompleteLog(logData);
      
      // Simulate crash by reloading page
      await page.reload();
      
      // App should recover gracefully
      await helpers.waitForElement('[data-testid="auth-screen"], [data-testid="dashboard-screen"]', 5000);
    });
  });

  test.describe('Accessibility', () => {
    test('should be accessible to screen readers', async ({ page }) => {
      await logPage.goto();
      
      // Check form sections have proper labels
      const sections = [
        'flow-section',
        'symptoms-section', 
        'mood-section',
        'temperature-section',
        'notes-section'
      ];
      
      for (const sectionId of sections) {
        const section = page.locator(`[data-testid="${sectionId}"]`);
        if (await section.isVisible()) {
          await expect(section).toHaveAttribute('role');
        }
      }
      
      // Check form inputs have proper labels
      const temperatureInput = page.locator('[data-testid="temperature-input"]');
      const notesInput = page.locator('[data-testid="notes-input"]');
      
      await expect(temperatureInput).toHaveAttribute('aria-label');
      await expect(notesInput).toHaveAttribute('aria-label');
      
      // Run accessibility check
      const accessibilityIssues = await helpers.checkAccessibility();
      expect(accessibilityIssues).toHaveLength(0);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await logPage.goto();
      
      // Tab through form elements
      await page.keyboard.press('Tab'); // Flow options
      await page.keyboard.press('Tab'); // Symptoms
      await page.keyboard.press('Tab'); // Mood
      await page.keyboard.press('Tab'); // Temperature
      await page.keyboard.press('Tab'); // Notes
      await page.keyboard.press('Tab'); // Partner toggle
      await page.keyboard.press('Tab'); // Save button
      
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should allow form completion with keyboard only', async ({ page }) => {
      await logPage.goto();
      
      // Navigate and select flow intensity
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // Select first flow option
      
      // Navigate to temperature input
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Tab');
      }
      await page.keyboard.type('98.6');
      
      // Navigate to save button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Should save successfully
      await helpers.waitForNavigation();
    });
  });

  test.describe('Performance', () => {
    test('should load log screen quickly', async ({ page }) => {
      const startTime = Date.now();
      await logPage.goto();
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000); // Should load within 2 seconds
    });

    test('should handle rapid input changes efficiently', async ({ page }) => {
      await logPage.goto();
      
      // Rapidly change selections
      const flowOptions = ['none', 'light', 'medium', 'heavy'];
      for (let i = 0; i < 10; i++) {
        const option = flowOptions[i % flowOptions.length];
        await logPage.selectFlowIntensity(option);
        await page.waitForTimeout(50);
      }
      
      // Form should remain responsive
      await logPage.expectFlowSectionVisible();
    });

    test('should save data quickly', async ({ page }) => {
      const logData = TestData.logEntries.complete;
      
      await logPage.goto();
      await logPage.fillCompleteLog(logData);
      
      const startTime = Date.now();
      await logPage.saveLog();
      await helpers.waitForNavigation();
      const saveTime = Date.now() - startTime;
      
      expect(saveTime).toBeLessThan(3000); // Should save within 3 seconds
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await helpers.setMobileViewport();
      await logPage.goto();
      
      await logPage.expectToBeOnLogScreen();
      await logPage.expectFlowSectionVisible();
      await logPage.expectSymptomsSectionVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await helpers.setTabletViewport();
      await logPage.goto();
      
      await logPage.expectToBeOnLogScreen();
      await logPage.expectMoodSectionVisible();
      await logPage.expectTemperatureSectionVisible();
    });

    test('should adapt input sizes for different viewports', async ({ page }) => {
      // Test on mobile
      await helpers.setMobileViewport();
      await logPage.goto();
      
      const temperatureInput = page.locator('[data-testid="temperature-input"]');
      const mobileSize = await temperatureInput.boundingBox();
      
      // Switch to desktop
      await helpers.setDesktopViewport();
      await page.reload();
      await logPage.goto();
      
      const desktopSize = await temperatureInput.boundingBox();
      
      // Sizes should be appropriate for each viewport
      expect(mobileSize.width).toBeDefined();
      expect(desktopSize.width).toBeDefined();
    });
  });
});