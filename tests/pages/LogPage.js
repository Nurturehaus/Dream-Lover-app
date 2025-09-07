import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class LogPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectors
    this.selectors = {
      container: '[data-testid="log-screen"]',
      header: '[data-testid="log-header"]',
      backButton: '[data-testid="back-button"]',
      saveButton: '[data-testid="save-button"]',
      
      // Flow intensity
      flowSection: '[data-testid="flow-section"]',
      flowOptions: {
        none: '[data-testid="flow-none"]',
        light: '[data-testid="flow-light"]',
        medium: '[data-testid="flow-medium"]',
        heavy: '[data-testid="flow-heavy"]',
      },
      
      // Symptoms
      symptomsSection: '[data-testid="symptoms-section"]',
      symptomButtons: '[data-testid^="symptom-"]',
      
      // Mood
      moodSection: '[data-testid="mood-section"]',
      moodEmojis: '[data-testid^="mood-"]',
      
      // Temperature
      temperatureSection: '[data-testid="temperature-section"]',
      temperatureInput: '[data-testid="temperature-input"]',
      
      // Notes
      notesSection: '[data-testid="notes-section"]',
      notesInput: '[data-testid="notes-input"]',
      
      // Partner visibility
      partnerToggle: '[data-testid="partner-toggle"]',
      partnerToggleLabel: 'text="Partner View"',
    };
  }

  // Navigation
  async goto() {
    await this.page.goto('/log'); // Direct navigation if available
    await this.waitForSelector(this.selectors.container);
  }

  async goBack() {
    await this.click(this.selectors.backButton);
    await this.waitForNavigation();
  }

  // Flow intensity
  async selectFlowIntensity(intensity) {
    const intensitySelector = this.selectors.flowOptions[intensity.toLowerCase()];
    if (!intensitySelector) {
      throw new Error(`Invalid flow intensity: ${intensity}`);
    }
    await this.click(intensitySelector);
  }

  // Symptoms
  async selectSymptom(symptomName) {
    const symptomSelector = `[data-testid="symptom-${symptomName.toLowerCase()}"]`;
    await this.click(symptomSelector);
  }

  async selectMultipleSymptoms(symptoms) {
    for (const symptom of symptoms) {
      await this.selectSymptom(symptom);
    }
  }

  async getSelectedSymptoms() {
    const selectedSymptoms = await this.page.locator('[data-testid^="symptom-"][aria-selected="true"], [data-testid^="symptom-"].selected').all();
    return await Promise.all(selectedSymptoms.map(async (symptom) => {
      const testId = await symptom.getAttribute('data-testid');
      return testId.replace('symptom-', '');
    }));
  }

  // Mood
  async selectMood(moodIndex) {
    const moodSelector = `[data-testid="mood-${moodIndex}"]`;
    await this.click(moodSelector);
  }

  async selectMoodByEmoji(emoji) {
    const moodSelector = `[data-testid^="mood-"]:has-text("${emoji}")`;
    await this.click(moodSelector);
  }

  // Temperature
  async enterTemperature(temperature) {
    await this.fill(this.selectors.temperatureInput, temperature.toString());
  }

  async getTemperature() {
    return await this.page.locator(this.selectors.temperatureInput).inputValue();
  }

  // Notes
  async enterNotes(notes) {
    await this.fill(this.selectors.notesInput, notes);
  }

  async getNotes() {
    return await this.page.locator(this.selectors.notesInput).inputValue();
  }

  // Partner visibility
  async togglePartnerVisibility() {
    await this.click(this.selectors.partnerToggle);
  }

  async setPartnerVisibility(visible) {
    const toggle = this.page.locator(this.selectors.partnerToggle);
    const isChecked = await toggle.isChecked();
    
    if (visible && !isChecked) {
      await this.togglePartnerVisibility();
    } else if (!visible && isChecked) {
      await this.togglePartnerVisibility();
    }
  }

  // Save
  async saveLog() {
    await this.click(this.selectors.saveButton);
    await this.waitForNavigation();
  }

  // Validations
  async expectToBeOnLogScreen() {
    await expect(this.page.locator(this.selectors.container)).toBeVisible();
  }

  async expectFlowSectionVisible() {
    await expect(this.page.locator(this.selectors.flowSection)).toBeVisible();
  }

  async expectSymptomsSectionVisible() {
    await expect(this.page.locator(this.selectors.symptomsSection)).toBeVisible();
  }

  async expectMoodSectionVisible() {
    await expect(this.page.locator(this.selectors.moodSection)).toBeVisible();
  }

  async expectTemperatureSectionVisible() {
    await expect(this.page.locator(this.selectors.temperatureSection)).toBeVisible();
  }

  async expectNotesSectionVisible() {
    await expect(this.page.locator(this.selectors.notesSection)).toBeVisible();
  }

  async expectPartnerToggleVisible() {
    await expect(this.page.locator(this.selectors.partnerToggle)).toBeVisible();
  }

  async expectFlowIntensitySelected(intensity) {
    const intensitySelector = this.selectors.flowOptions[intensity.toLowerCase()];
    await expect(this.page.locator(intensitySelector)).toHaveClass(/selected|active/);
  }

  async expectSymptomSelected(symptomName) {
    const symptomSelector = `[data-testid="symptom-${symptomName.toLowerCase()}"]`;
    await expect(this.page.locator(symptomSelector)).toHaveClass(/selected|active/);
  }

  async expectMoodSelected(moodIndex) {
    const moodSelector = `[data-testid="mood-${moodIndex}"]`;
    await expect(this.page.locator(moodSelector)).toHaveClass(/selected|active/);
  }

  async expectTemperatureValue(expectedTemperature) {
    const actualTemperature = await this.getTemperature();
    expect(actualTemperature).toBe(expectedTemperature.toString());
  }

  async expectNotesValue(expectedNotes) {
    const actualNotes = await this.getNotes();
    expect(actualNotes).toBe(expectedNotes);
  }

  async expectPartnerVisibilityEnabled(enabled) {
    const toggle = this.page.locator(this.selectors.partnerToggle);
    if (enabled) {
      await expect(toggle).toBeChecked();
    } else {
      await expect(toggle).not.toBeChecked();
    }
  }

  // Helper methods
  async fillCompleteLog(logData) {
    if (logData.flowIntensity) {
      await this.selectFlowIntensity(logData.flowIntensity);
    }
    
    if (logData.symptoms && logData.symptoms.length > 0) {
      await this.selectMultipleSymptoms(logData.symptoms);
    }
    
    if (logData.mood !== undefined) {
      await this.selectMood(logData.mood);
    }
    
    if (logData.temperature) {
      await this.enterTemperature(logData.temperature);
    }
    
    if (logData.notes) {
      await this.enterNotes(logData.notes);
    }
    
    if (logData.partnerVisible !== undefined) {
      await this.setPartnerVisibility(logData.partnerVisible);
    }
  }

  async getLogData() {
    return {
      symptoms: await this.getSelectedSymptoms(),
      temperature: await this.getTemperature(),
      notes: await this.getNotes(),
    };
  }
}