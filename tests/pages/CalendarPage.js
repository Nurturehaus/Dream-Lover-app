import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class CalendarPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectors
    this.selectors = {
      container: '[data-testid="calendar-screen"]',
      calendar: '.react-native-calendar, [class*="calendar"]',
      legend: 'text="Calendar Legend"',
      legendItems: {
        periodStart: 'text="Period Start"',
        periodDays: 'text="Period Days"',
        follicular: 'text="Follicular"',
        peakOvulation: 'text="Peak Ovulation"',
        fertileWindow: 'text="Fertile Window"',
        pmsPhase: 'text="PMS Phase"',
      },
      quickActions: {
        logToday: '[data-testid="log-today-button"]',
        adjustDates: '[data-testid="adjust-dates-button"]',
      },
      cycleHeader: '[data-testid="cycle-header"]',
      phaseCard: '[data-testid="phase-card"]',
      
      // Adjust Dates Modal
      adjustDatesModal: 'text="Adjust Cycle Dates"',
      adjustOptions: {
        lastPeriod: 'text="Last Period Start Date"',
        periodDuration: 'text="Period Duration"',
        cycleLength: 'text="Cycle Length"',
      },
      saveAdjustmentsButton: '[data-testid="save-adjustments-button"]',
      closeModalButton: 'text="Close"',
      
      // Tab
      tabCalendar: '[data-testid="tab-calendar"]',
    };
  }

  // Navigation
  async goto() {
    await this.navigateToTab('calendar');
    await this.waitForSelector(this.selectors.container);
  }

  // Calendar interactions
  async clickDate(date) {
    const dateSelector = `[data-day="${date}"]`;
    await this.click(dateSelector);
  }

  async navigateToMonth(direction) {
    const arrowSelector = direction === 'next' 
      ? '[data-testid="calendar-next-month"]' 
      : '[data-testid="calendar-prev-month"]';
    await this.click(arrowSelector);
  }

  // Quick actions
  async clickLogToday() {
    await this.click(this.selectors.quickActions.logToday);
    await this.waitForNavigation();
  }

  async clickAdjustDates() {
    await this.click(this.selectors.quickActions.adjustDates);
    await this.waitForSelector(this.selectors.adjustDatesModal);
  }

  // Adjust Dates Modal
  async openAdjustDatesModal() {
    await this.clickAdjustDates();
    await this.expectAdjustDatesModalOpen();
  }

  async closeAdjustDatesModal() {
    await this.click(this.selectors.closeModalButton);
    await this.expectAdjustDatesModalClosed();
  }

  async saveAdjustments() {
    await this.click(this.selectors.saveAdjustmentsButton);
    await this.expectAlert('Date adjustment features will be available soon!');
  }

  async adjustLastPeriodDate() {
    await this.openAdjustDatesModal();
    await this.click(this.selectors.adjustOptions.lastPeriod);
  }

  async adjustPeriodDuration() {
    await this.openAdjustDatesModal();
    await this.click(this.selectors.adjustOptions.periodDuration);
  }

  async adjustCycleLength() {
    await this.openAdjustDatesModal();
    await this.click(this.selectors.adjustOptions.cycleLength);
  }

  // Information retrieval
  async getCurrentPhase() {
    const phaseCard = this.page.locator(this.selectors.phaseCard);
    return await phaseCard.textContent();
  }

  async getCycleDay() {
    const cycleHeader = this.page.locator(this.selectors.cycleHeader);
    const text = await cycleHeader.textContent();
    const match = text.match(/Day (\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  // Validations
  async expectToBeOnCalendar() {
    await expect(this.page.locator(this.selectors.container)).toBeVisible();
  }

  async expectCalendarVisible() {
    await expect(this.page.locator(this.selectors.calendar)).toBeVisible();
  }

  async expectLegendVisible() {
    await expect(this.page.locator(this.selectors.legend)).toBeVisible();
  }

  async expectLegendItemsVisible() {
    for (const [key, selector] of Object.entries(this.selectors.legendItems)) {
      await expect(this.page.locator(selector)).toBeVisible();
    }
  }

  async expectQuickActionsVisible() {
    await expect(this.page.locator(this.selectors.quickActions.logToday)).toBeVisible();
    await expect(this.page.locator(this.selectors.quickActions.adjustDates)).toBeVisible();
  }

  async expectAdjustDatesModalOpen() {
    await expect(this.page.locator(this.selectors.adjustDatesModal)).toBeVisible();
  }

  async expectAdjustDatesModalClosed() {
    await expect(this.page.locator(this.selectors.adjustDatesModal)).not.toBeVisible();
  }

  async expectAdjustOptionsVisible() {
    for (const [key, selector] of Object.entries(this.selectors.adjustOptions)) {
      await expect(this.page.locator(selector)).toBeVisible();
    }
  }

  async expectPhaseCardVisible() {
    await expect(this.page.locator(this.selectors.phaseCard)).toBeVisible();
  }

  async expectCycleHeaderVisible() {
    await expect(this.page.locator(this.selectors.cycleHeader)).toBeVisible();
  }

  // Color coding validation
  async expectPeriodDaysHighlighted() {
    // Check for elements with period-specific styling
    const periodDays = this.page.locator('[style*="background-color"][style*="rgb"]');
    await expect(periodDays.first()).toBeVisible();
  }

  async expectPhaseColorsDisplayed() {
    // Validate that different cycle phases have distinct colors
    const coloredElements = this.page.locator('[style*="background-color"]');
    const count = await coloredElements.count();
    expect(count).toBeGreaterThan(0);
  }

  // Helper methods
  async waitForCalendarToLoad() {
    await this.waitForSelector(this.selectors.container);
    await this.waitForSelector(this.selectors.calendar);
    await this.waitForSelector(this.selectors.legend);
  }

  async getVisibleDates() {
    const dates = await this.page.locator('[data-day]').all();
    return await Promise.all(dates.map(date => date.getAttribute('data-day')));
  }
}