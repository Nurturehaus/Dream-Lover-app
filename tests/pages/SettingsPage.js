import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class SettingsPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectors
    this.selectors = {
      container: '[data-testid="settings-screen"]',
      profileSection: '[data-testid="profile-section"]',
      editProfileButton: '[data-testid="edit-profile-button"]',
      notificationsSection: '[data-testid="notifications-section"]',
      periodAlertsToggle: 'text="Period Alerts" >> .. >> input[type="checkbox"], [role="switch"]',
      dailyRemindersToggle: 'text="Daily Reminders" >> .. >> input[type="checkbox"], [role="switch"]',
      giftSuggestionsToggle: 'text="Gift Suggestions" >> .. >> input[type="checkbox"], [role="switch"]',
      partnersSection: '[data-testid="partners-section"]',
      addPartnerButton: '[data-testid="add-partner-button"]',
      partnerItem: '[data-testid^="partner-"]',
      signOutButton: 'text="Sign Out"',
      
      // Modals
      editProfileModal: 'text="Edit Profile"',
      nameInput: 'input[placeholder="Name"]',
      emailInput: 'input[placeholder="Email"]',
      saveButton: 'text="Save"',
      cancelButton: 'text="Cancel"',
      
      partnerInviteModal: 'text="Invite Partner"',
      partnerNameInput: '[data-testid="partner-name-input"]',
      partnerEmailInput: '[data-testid="partner-email-input"]',
      sendInviteButton: '[data-testid="send-invite-button"]',
      
      partnerManagementModal: 'text="Manage Partner"',
      deletePartnerButton: '[data-testid="delete-partner-button"]',
      
      // Tab
      tabProfile: '[data-testid="tab-profile"]',
    };
  }

  // Navigation
  async goto() {
    await this.navigateToTab('profile');
    await this.waitForSelector(this.selectors.container);
  }

  // Profile management
  async clickEditProfile() {
    await this.click(this.selectors.editProfileButton);
    await this.waitForSelector(this.selectors.editProfileModal);
  }

  async editProfile(userData) {
    await this.clickEditProfile();
    await this.fill(this.selectors.nameInput, userData.name);
    await this.fill(this.selectors.emailInput, userData.email);
    await this.click(this.selectors.saveButton);
    await this.expectAlert('Profile updated successfully');
  }

  // Notification settings
  async togglePeriodAlerts() {
    await this.click(this.selectors.periodAlertsToggle);
  }

  async toggleDailyReminders() {
    await this.click(this.selectors.dailyRemindersToggle);
  }

  async toggleGiftSuggestions() {
    await this.click(this.selectors.giftSuggestionsToggle);
  }

  // Partner management
  async clickAddPartner() {
    await this.click(this.selectors.addPartnerButton);
    await this.waitForSelector(this.selectors.partnerInviteModal);
  }

  async invitePartner(partnerData) {
    await this.clickAddPartner();
    await this.fill(this.selectors.partnerNameInput, partnerData.name);
    await this.fill(this.selectors.partnerEmailInput, partnerData.email);
    await this.click(this.selectors.sendInviteButton);
    await this.expectAlert('Invite Sent!');
  }

  async clickPartner(partnerId) {
    await this.click(`[data-testid="partner-${partnerId}"]`);
    await this.waitForSelector(this.selectors.partnerManagementModal);
  }

  async deletePartner(partnerId) {
    await this.clickPartner(partnerId);
    await this.click(this.selectors.deletePartnerButton);
    await this.handleAlert('accept');
    await this.expectAlert('Partner removed successfully');
  }

  // Sign out
  async signOut() {
    await this.click(this.selectors.signOutButton);
    
    // Handle confirmation dialog
    this.page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to sign out?');
      await dialog.accept();
    });
  }

  // Validations
  async expectToBeOnSettings() {
    await expect(this.page.locator(this.selectors.container)).toBeVisible();
  }

  async expectProfileSectionVisible() {
    await expect(this.page.locator(this.selectors.profileSection)).toBeVisible();
  }

  async expectNotificationsSectionVisible() {
    await expect(this.page.locator(this.selectors.notificationsSection)).toBeVisible();
  }

  async expectPartnersSectionVisible() {
    await expect(this.page.locator(this.selectors.partnersSection)).toBeVisible();
  }

  async expectPartnerInviteModalOpen() {
    await expect(this.page.locator(this.selectors.partnerInviteModal)).toBeVisible();
  }

  async expectPartnerManagementModalOpen() {
    await expect(this.page.locator(this.selectors.partnerManagementModal)).toBeVisible();
  }

  async expectEditProfileModalOpen() {
    await expect(this.page.locator(this.selectors.editProfileModal)).toBeVisible();
  }

  // Helper methods
  async getPartnerCount() {
    return await this.page.locator(this.selectors.partnerItem).count();
  }

  async isToggleEnabled(toggleSelector) {
    const toggle = this.page.locator(toggleSelector);
    return await toggle.isChecked();
  }
}