import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectors
    this.selectors = {
      container: '[data-testid="dashboard-screen"], [testid="dashboard-container"]',
      scrollView: '[data-testid="dashboard-scroll-view"], [testid="dashboard-scroll"]',
      header: '[data-testid="dashboard-header"]',
      notificationButton: '[data-testid="notification-button"]',
      profileButton: '[data-testid="profile-button"]',
      cycleCard: '[data-testid="cycle-card"]',
      cycleDay: '[data-testid="cycle-day"]',
      cyclePhase: '[data-testid="cycle-phase"]',
      logPeriodButton: '[data-testid="log-period-button"]',
      logSymptomsButton: '[data-testid="log-symptoms-button"]',
      partnerSection: '[data-testid="partner-section"]',
      connectPartnerButton: '[data-testid="connect-partner-button"]',
      sendCareButton: '[data-testid="send-care-button"]',
      tabHome: '[data-testid="tab-home"]',
    };
  }

  // Navigation
  async goto() {
    await this.navigateToTab('home');
    await this.waitForSelector(this.selectors.container);
  }

  // Header interactions
  async clickNotifications() {
    await this.click(this.selectors.notificationButton);
  }

  async clickProfile() {
    await this.click(this.selectors.profileButton);
    await this.waitForNavigation();
  }

  // Cycle tracking interactions
  async clickLogPeriod() {
    await this.click(this.selectors.logPeriodButton);
    await this.waitForNavigation();
  }

  async clickLogSymptoms() {
    await this.click(this.selectors.logSymptomsButton);
    await this.waitForNavigation();
  }

  // Partner interactions
  async clickConnectPartner() {
    await this.click(this.selectors.connectPartnerButton);
    await this.waitForNavigation();
  }

  async clickSendCare() {
    await this.click(this.selectors.sendCareButton);
  }

  // Information retrieval
  async getCycleDay() {
    return await this.getText(this.selectors.cycleDay);
  }

  async getCyclePhase() {
    return await this.getText(this.selectors.cyclePhase);
  }

  // Validations
  async expectToBeOnDashboard() {
    await expect(this.page.locator(this.selectors.container)).toBeVisible();
  }

  async expectCycleInfoDisplayed() {
    await expect(this.page.locator(this.selectors.cycleCard)).toBeVisible();
  }

  async expectActionButtonsVisible() {
    await expect(this.page.locator(this.selectors.logPeriodButton)).toBeVisible();
    await expect(this.page.locator(this.selectors.logSymptomsButton)).toBeVisible();
  }

  async expectPartnerSectionVisible() {
    await expect(this.page.locator(this.selectors.partnerSection)).toBeVisible();
  }

  async expectHeaderElementsVisible() {
    await expect(this.page.locator(this.selectors.notificationButton)).toBeVisible();
    await expect(this.page.locator(this.selectors.profileButton)).toBeVisible();
  }

  // Helper methods
  async waitForDashboardToLoad() {
    await this.waitForSelector(this.selectors.container);
    await this.waitForSelector(this.selectors.cycleCard);
  }

  async scrollToBottom() {
    await this.page.locator(this.selectors.scrollView).scrollIntoViewIfNeeded();
  }
}