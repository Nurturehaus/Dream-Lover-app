import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { CalendarPage } from '../pages/CalendarPage.js';
import { LogPage } from '../pages/LogPage.js';
import { TestHelpers } from '../utils/helpers.js';
import { TestData, TestDataHelpers } from '../fixtures/testData.js';

test.describe('Calendar Flow', () => {
  let authPage;
  let dashboardPage;
  let calendarPage;
  let logPage;
  let helpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    calendarPage = new CalendarPage(page);
    logPage = new LogPage(page);
    helpers = new TestHelpers(page);
    
    // Clear app data and register a user
    await helpers.clearAppData();
    const userData = TestDataHelpers.generateRandomUser();
    await helpers.registerUser(userData);
  });

  test.describe('Calendar Display', () => {
    test('should display calendar correctly', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.expectToBeOnCalendar();
      await calendarPage.expectCalendarVisible();
    });

    test('should show legend with cycle phases', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.expectLegendVisible();
      await calendarPage.expectLegendItemsVisible();
    });

    test('should display current cycle header', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.expectCycleHeaderVisible();
      await calendarPage.expectPhaseCardVisible();
      
      const cycleDay = await calendarPage.getCycleDay();
      expect(cycleDay).toBeGreaterThan(0);
      expect(cycleDay).toBeLessThanOrEqual(35);
    });

    test('should show quick action buttons', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.expectQuickActionsVisible();
    });

    test('should display period days with special highlighting', async ({ page }) => {
      // Mock some period data
      await page.evaluate(() => {
        const cycleData = {
          lastPeriodStart: new Date().toISOString().split('T')[0],
          periodDuration: 5
        };
        localStorage.setItem('cycleData', JSON.stringify(cycleData));
      });
      
      await page.reload();
      await calendarPage.goto();
      
      await calendarPage.expectPeriodDaysHighlighted();
    });

    test('should show different colors for cycle phases', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.expectPhaseColorsDisplayed();
    });
  });

  test.describe('Calendar Navigation', () => {
    test('should navigate between months', async ({ page }) => {
      await calendarPage.goto();
      
      // Navigate to next month
      await calendarPage.navigateToMonth('next');
      await helpers.waitForStableDOM();
      
      // Navigate back to previous month
      await calendarPage.navigateToMonth('previous');
      await helpers.waitForStableDOM();
      
      // Calendar should still be visible
      await calendarPage.expectCalendarVisible();
    });

    test('should allow date selection', async ({ page }) => {
      await calendarPage.goto();
      
      // Get available dates and click one
      const visibleDates = await calendarPage.getVisibleDates();
      if (visibleDates.length > 0) {
        const dateToClick = visibleDates[Math.floor(visibleDates.length / 2)];
        await calendarPage.clickDate(dateToClick);
        
        // Should show date details or navigate to log for that date
        await helpers.waitForElement('[data-testid="date-details"], [data-testid="log-screen"]', 5000);
      }
    });
  });

  test.describe('Quick Actions', () => {
    test('should navigate to log screen when clicking Log Today', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.clickLogToday();
      await logPage.expectToBeOnLogScreen();
    });

    test('should open adjust dates modal', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.openAdjustDatesModal();
      await calendarPage.expectAdjustDatesModalOpen();
      await calendarPage.expectAdjustOptionsVisible();
    });

    test('should close adjust dates modal', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.openAdjustDatesModal();
      await calendarPage.closeAdjustDatesModal();
      await calendarPage.expectAdjustDatesModalClosed();
    });
  });

  test.describe('Adjust Dates Functionality', () => {
    test('should show adjust last period option', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.adjustLastPeriodDate();
      
      // Should show date picker or alert
      await helpers.waitForElement('[data-testid="date-picker"], .alert', 3000);
    });

    test('should show adjust period duration option', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.adjustPeriodDuration();
      
      // Should show duration selector or alert
      await helpers.waitForElement('[data-testid="duration-selector"], .alert', 3000);
    });

    test('should show adjust cycle length option', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.adjustCycleLength();
      
      // Should show cycle length selector or alert
      await helpers.waitForElement('[data-testid="cycle-length-selector"], .alert', 3000);
    });

    test('should save adjustments with confirmation', async ({ page }) => {
      await calendarPage.goto();
      await calendarPage.openAdjustDatesModal();
      
      // Try to save adjustments
      await calendarPage.saveAdjustments();
      
      // Should show alert about future availability
      await helpers.expectAlert('Date adjustment features will be available soon!');
    });
  });

  test.describe('Cycle Phase Visualization', () => {
    test('should show current phase information', async ({ page }) => {
      await calendarPage.goto();
      
      const currentPhase = await calendarPage.getCurrentPhase();
      expect(currentPhase).toMatch(/menstrual|follicular|ovulation|luteal|pms/i);
    });

    test('should display period start indicators', async ({ page }) => {
      // Mock period data with specific start date
      await page.evaluate(() => {
        const today = new Date();
        const periodStart = new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000)); // 2 days ago
        
        const cycleData = {
          lastPeriodStart: periodStart.toISOString().split('T')[0],
          periodDuration: 5
        };
        localStorage.setItem('cycleData', JSON.stringify(cycleData));
      });
      
      await page.reload();
      await calendarPage.goto();
      
      // Period start day should be specially marked
      await calendarPage.expectPeriodDaysHighlighted();
    });

    test('should show fertile window highlighting', async ({ page }) => {
      // Mock cycle data to show fertile window
      await page.evaluate(() => {
        const today = new Date();
        const periodStart = new Date(today.getTime() - (12 * 24 * 60 * 60 * 1000)); // 12 days ago (mid-cycle)
        
        const cycleData = {
          lastPeriodStart: periodStart.toISOString().split('T')[0],
          averageCycleLength: 28,
          periodDuration: 5
        };
        localStorage.setItem('cycleData', JSON.stringify(cycleData));
      });
      
      await page.reload();
      await calendarPage.goto();
      
      // Should show fertile window colors
      await calendarPage.expectPhaseColorsDisplayed();
    });

    test('should display PMS phase indicators', async ({ page }) => {
      // Mock cycle data for PMS phase
      await page.evaluate(() => {
        const today = new Date();
        const periodStart = new Date(today.getTime() - (25 * 24 * 60 * 60 * 1000)); // 25 days ago (PMS time)
        
        const cycleData = {
          lastPeriodStart: periodStart.toISOString().split('T')[0],
          averageCycleLength: 28,
          periodDuration: 5
        };
        localStorage.setItem('cycleData', JSON.stringify(cycleData));
      });
      
      await page.reload();
      await calendarPage.goto();
      
      const currentPhase = await calendarPage.getCurrentPhase();
      expect(currentPhase.toLowerCase()).toContain('pms');
    });
  });

  test.describe('Data Integration', () => {
    test('should reflect logged symptoms on calendar', async ({ page }) => {
      // First log some symptoms
      const logData = TestData.logEntries.complete;
      await logPage.goto();
      await logPage.fillCompleteLog(logData);
      await logPage.saveLog();
      
      // Go to calendar and check for symptom indicators
      await calendarPage.goto();
      
      // Today's date should show logged data indicators
      const today = new Date().getDate();
      const todayElement = page.locator(`[data-day="${today}"]`);
      await expect(todayElement).toHaveClass(/logged|has-data/);
    });

    test('should update predictions based on logged data', async ({ page }) => {
      // Log period data for multiple cycles
      const dates = [
        new Date(Date.now() - (28 * 24 * 60 * 60 * 1000)),
        new Date(Date.now() - (56 * 24 * 60 * 60 * 1000)),
        new Date(Date.now() - (84 * 24 * 60 * 60 * 1000))
      ];
      
      await page.evaluate((dates) => {
        const logEntries = dates.map(date => ({
          date: date.toISOString().split('T')[0],
          flowIntensity: 'medium',
          isPeriodStart: true
        }));
        localStorage.setItem('logEntries', JSON.stringify(logEntries));
      }, dates);
      
      await page.reload();
      await calendarPage.goto();
      
      // Should show improved predictions
      const currentPhase = await calendarPage.getCurrentPhase();
      expect(currentPhase).toBeDefined();
    });

    test('should handle irregular cycles', async ({ page }) => {
      // Mock irregular cycle data
      await page.evaluate(() => {
        const irregularDates = [
          new Date(Date.now() - (21 * 24 * 60 * 60 * 1000)), // 21 days ago
          new Date(Date.now() - (56 * 24 * 60 * 60 * 1000)), // 35-day cycle
          new Date(Date.now() - (84 * 24 * 60 * 60 * 1000))  // 28-day cycle
        ];
        
        const logEntries = irregularDates.map(date => ({
          date: date.toISOString().split('T')[0],
          flowIntensity: 'medium',
          isPeriodStart: true
        }));
        localStorage.setItem('logEntries', JSON.stringify(logEntries));
      });
      
      await page.reload();
      await calendarPage.goto();
      
      // Should still display calendar with best-effort predictions
      await calendarPage.expectCalendarVisible();
      await calendarPage.expectPhaseCardVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load calendar quickly', async ({ page }) => {
      const startTime = Date.now();
      await calendarPage.goto();
      await calendarPage.waitForCalendarToLoad();
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      // Mock large dataset of log entries
      await page.evaluate(() => {
        const largeDataset = Array.from({ length: 365 }, (_, i) => ({
          date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          flowIntensity: ['none', 'light', 'medium', 'heavy'][Math.floor(Math.random() * 4)],
          symptoms: ['cramps', 'headache', 'fatigue'].slice(0, Math.floor(Math.random() * 3))
        }));
        localStorage.setItem('logEntries', JSON.stringify(largeDataset));
      });
      
      const startTime = Date.now();
      await page.reload();
      await calendarPage.goto();
      await calendarPage.waitForCalendarToLoad();
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000); // Should still load within 5 seconds
    });

    test('should scroll smoothly between months', async ({ page }) => {
      await calendarPage.goto();
      
      // Navigate multiple months quickly
      for (let i = 0; i < 3; i++) {
        await calendarPage.navigateToMonth('next');
        await page.waitForTimeout(200); // Small delay for animation
      }
      
      // Calendar should remain responsive
      await calendarPage.expectCalendarVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should be accessible to screen readers', async ({ page }) => {
      await calendarPage.goto();
      
      // Check calendar has proper ARIA labels
      const calendar = page.locator(calendarPage.selectors.calendar);
      await expect(calendar).toHaveAttribute('role');
      
      // Check navigation buttons have labels
      const nextButton = page.locator('[data-testid="calendar-next-month"]');
      const prevButton = page.locator('[data-testid="calendar-prev-month"]');
      
      if (await nextButton.isVisible()) {
        await expect(nextButton).toHaveAttribute('aria-label');
      }
      if (await prevButton.isVisible()) {
        await expect(prevButton).toHaveAttribute('aria-label');
      }
      
      // Run accessibility check
      const accessibilityIssues = await helpers.checkAccessibility();
      expect(accessibilityIssues).toHaveLength(0);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await calendarPage.goto();
      
      // Should be able to navigate calendar with arrow keys
      await page.keyboard.press('Tab'); // Focus on calendar
      await page.keyboard.press('ArrowRight'); // Move to next date
      await page.keyboard.press('ArrowDown'); // Move down a week
      await page.keyboard.press('Enter'); // Select date
      
      // Should show some interaction (date details or navigation)
      await helpers.waitForElement('[data-testid="date-details"], [data-testid="log-screen"]', 5000);
    });

    test('should have proper focus indicators', async ({ page }) => {
      await calendarPage.goto();
      
      // Tab through interactive elements
      await page.keyboard.press('Tab'); // Quick actions
      await page.keyboard.press('Tab'); // Calendar dates
      
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Focused element should have visible focus indicator
      const hasOutline = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.outline !== 'none' || styles.boxShadow !== 'none';
      });
      expect(hasOutline).toBe(true);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle missing cycle data gracefully', async ({ page }) => {
      // Clear all cycle data
      await page.evaluate(() => {
        localStorage.removeItem('cycleData');
        localStorage.removeItem('logEntries');
      });
      
      await page.reload();
      await calendarPage.goto();
      
      // Should still display calendar with default state
      await calendarPage.expectCalendarVisible();
      await calendarPage.expectLegendVisible();
    });

    test('should handle corrupted data', async ({ page }) => {
      // Add corrupted data
      await page.evaluate(() => {
        localStorage.setItem('cycleData', 'invalid json');
        localStorage.setItem('logEntries', '{broken}');
      });
      
      await page.reload();
      await calendarPage.goto();
      
      // Should fallback to default state
      await calendarPage.expectCalendarVisible();
    });

    test('should handle network errors during data sync', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/**', (route) => {
        route.abort('failed');
      });
      
      await calendarPage.goto();
      
      // Should work with local data
      await calendarPage.expectCalendarVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await helpers.setMobileViewport();
      await calendarPage.goto();
      
      await calendarPage.expectCalendarVisible();
      await calendarPage.expectQuickActionsVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await helpers.setTabletViewport();
      await calendarPage.goto();
      
      await calendarPage.expectCalendarVisible();
      await calendarPage.expectLegendVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
      await helpers.setDesktopViewport();
      await calendarPage.goto();
      
      await calendarPage.expectCalendarVisible();
      await calendarPage.expectLegendItemsVisible();
    });
  });
});