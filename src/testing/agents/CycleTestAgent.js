// Cycle Tracking Test Agent for CareSync App
// Comprehensive testing for all cycle tracking functionality

import { TestRunner, TestAssertion, MockStorage } from '../TestFramework.js';
import moment from 'moment';

/**
 * Mock AsyncStorage implementation that prevents actual storage calls during testing
 */
class MockAsyncStorage {
  constructor() {
    this.storage = {};
  }

  async getItem(key) {
    return this.storage[key] || null;
  }

  async setItem(key, value) {
    this.storage[key] = value;
  }

  async removeItem(key) {
    delete this.storage[key];
  }

  async clear() {
    this.storage = {};
  }

  getAll() {
    return { ...this.storage };
  }
}

/**
 * Mock Cycle Context for isolated testing
 */
class MockCycleContext {
  constructor(mockStorage = new MockAsyncStorage()) {
    this.storage = mockStorage;
    this.cycleData = {
      averageCycleLength: 28,
      averagePeriodLength: 5,
      lastPeriodDate: null,
      nextPeriodDate: null,
      currentPhase: 'follicular',
      daysUntilNextPeriod: null,
      cycleDay: null,
    };
    this.periods = [];
    this.symptoms = [];
    this.dailyLogs = [];
  }

  // Reset all state for test isolation
  reset() {
    this.storage.clear();
    this.cycleData = {
      averageCycleLength: 28,
      averagePeriodLength: 5,
      lastPeriodDate: null,
      nextPeriodDate: null,
      currentPhase: 'follicular',
      daysUntilNextPeriod: null,
      cycleDay: null,
    };
    this.periods = [];
    this.symptoms = [];
    this.dailyLogs = [];
  }

  // Load cycle data from mock storage
  async loadCycleData() {
    try {
      const [periodsData, symptomsData, logsData, cycleSettings] = await Promise.all([
        this.storage.getItem('periods'),
        this.storage.getItem('symptoms'),
        this.storage.getItem('dailyLogs'),
        this.storage.getItem('cycleSettings'),
      ]);

      if (periodsData) this.periods = JSON.parse(periodsData);
      if (symptomsData) this.symptoms = JSON.parse(symptomsData);
      if (logsData) this.dailyLogs = JSON.parse(logsData);
      if (cycleSettings) {
        this.cycleData = { ...this.cycleData, ...JSON.parse(cycleSettings) };
      }
    } catch (error) {
      console.error('Error loading cycle data:', error);
    }
  }

  // Calculate cycle information
  calculateCycleInfo() {
    if (this.periods.length === 0) return;

    const sortedPeriods = [...this.periods].sort((a, b) => 
      moment(b.startDate).diff(moment(a.startDate))
    );
    
    const lastPeriod = sortedPeriods[0];
    const today = moment();
    const lastPeriodStart = moment(lastPeriod.startDate);
    const daysSinceLastPeriod = today.diff(lastPeriodStart, 'days');
    
    // Calculate average cycle length if we have enough data
    let avgCycleLength = this.cycleData.averageCycleLength;
    if (sortedPeriods.length >= 2) {
      const cycleLengths = [];
      for (let i = 0; i < sortedPeriods.length - 1; i++) {
        const diff = moment(sortedPeriods[i].startDate).diff(
          moment(sortedPeriods[i + 1].startDate),
          'days'
        );
        cycleLengths.push(diff);
      }
      avgCycleLength = Math.round(
        cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
      );
    }

    // Calculate next period date
    const nextPeriodDate = lastPeriodStart.clone().add(avgCycleLength, 'days');
    const daysUntilNextPeriod = Math.ceil(nextPeriodDate.diff(today, 'days', true));

    // Determine current phase
    let currentPhase = 'menstrual';
    if (daysSinceLastPeriod <= 5) {
      currentPhase = 'menstrual';
    } else if (daysSinceLastPeriod <= 13) {
      currentPhase = 'follicular';
    } else if (daysSinceLastPeriod <= 16) {
      currentPhase = 'ovulation';
    } else {
      currentPhase = 'luteal';
    }

    this.cycleData = {
      ...this.cycleData,
      averageCycleLength: avgCycleLength,
      lastPeriodDate: lastPeriod.startDate,
      nextPeriodDate: nextPeriodDate.format('YYYY-MM-DD'),
      currentPhase,
      daysUntilNextPeriod: Math.max(0, daysUntilNextPeriod),
      cycleDay: daysSinceLastPeriod + 1,
    };
  }

  // Add a new period
  async addPeriod(periodData) {
    try {
      const newPeriod = {
        id: Date.now().toString(),
        ...periodData,
        createdAt: new Date().toISOString(),
      };
      
      this.periods = [...this.periods, newPeriod];
      await this.storage.setItem('periods', JSON.stringify(this.periods));
      
      return { success: true, period: newPeriod };
    } catch (error) {
      console.error('Error adding period:', error);
      return { success: false, error: error.message };
    }
  }

  // Update an existing period
  async updatePeriod(periodId, updates) {
    try {
      this.periods = this.periods.map(p => 
        p.id === periodId ? { ...p, ...updates } : p
      );
      
      await this.storage.setItem('periods', JSON.stringify(this.periods));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating period:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete a period
  async deletePeriod(periodId) {
    try {
      this.periods = this.periods.filter(p => p.id !== periodId);
      await this.storage.setItem('periods', JSON.stringify(this.periods));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting period:', error);
      return { success: false, error: error.message };
    }
  }

  // Add or update daily log
  async addDailyLog(logData) {
    try {
      const date = logData.date || moment().format('YYYY-MM-DD');
      const existingLogIndex = this.dailyLogs.findIndex(log => log.date === date);
      
      if (existingLogIndex >= 0) {
        // Update existing log for this date
        this.dailyLogs[existingLogIndex] = {
          ...this.dailyLogs[existingLogIndex],
          ...logData,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Create new log
        const newLog = {
          id: Date.now().toString(),
          date,
          ...logData,
          createdAt: new Date().toISOString(),
        };
        this.dailyLogs = [...this.dailyLogs, newLog];
      }
      
      await this.storage.setItem('dailyLogs', JSON.stringify(this.dailyLogs));
      
      return { success: true };
    } catch (error) {
      console.error('Error adding daily log:', error);
      return { success: false, error: error.message };
    }
  }

  // Get daily log for a specific date
  getDailyLog(date) {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.dailyLogs.find(log => log.date === formattedDate);
  }

  // Add a symptom
  async addSymptom(symptomData) {
    try {
      const newSymptom = {
        id: Date.now().toString(),
        date: moment().format('YYYY-MM-DD'),
        ...symptomData,
        createdAt: new Date().toISOString(),
      };
      
      this.symptoms = [...this.symptoms, newSymptom];
      await this.storage.setItem('symptoms', JSON.stringify(this.symptoms));
      
      return { success: true, symptom: newSymptom };
    } catch (error) {
      console.error('Error adding symptom:', error);
      return { success: false, error: error.message };
    }
  }

  // Get symptoms by date
  getSymptomsByDate(date) {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.symptoms.filter(s => s.date === formattedDate);
  }

  // Update cycle settings
  async updateCycleSettings(settings) {
    try {
      this.cycleData = { ...this.cycleData, ...settings };
      await this.storage.setItem('cycleSettings', JSON.stringify(this.cycleData));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating cycle settings:', error);
      return { success: false, error: error.message };
    }
  }

  // Get cycle predictions
  getPredictions() {
    const predictions = [];
    
    if (this.cycleData.nextPeriodDate) {
      const nextPeriod = moment(this.cycleData.nextPeriodDate);
      
      // Predict next 3 cycles
      for (let i = 0; i < 3; i++) {
        const periodStart = nextPeriod.clone().add(i * this.cycleData.averageCycleLength, 'days');
        const ovulationDate = periodStart.clone().subtract(14, 'days');
        const fertileStart = ovulationDate.clone().subtract(5, 'days');
        const fertileEnd = ovulationDate.clone().add(1, 'days');
        
        predictions.push({
          periodStart: periodStart.format('YYYY-MM-DD'),
          periodEnd: periodStart.clone().add(this.cycleData.averagePeriodLength - 1, 'days').format('YYYY-MM-DD'),
          ovulationDate: ovulationDate.format('YYYY-MM-DD'),
          fertileWindowStart: fertileStart.format('YYYY-MM-DD'),
          fertileWindowEnd: fertileEnd.format('YYYY-MM-DD'),
        });
      }
    }
    
    return predictions;
  }
}

/**
 * Cycle Test Agent Class
 */
export class CycleTestAgent extends TestRunner {
  constructor() {
    super('Cycle Tracking');
    this.mockCycleContext = new MockCycleContext();
    this.setupTests();
  }

  setupTests() {
    // Period tracking tests
    this.addTest('Add new period successfully', this.testAddPeriod.bind(this));
    this.addTest('Update existing period', this.testUpdatePeriod.bind(this));
    this.addTest('Delete period', this.testDeletePeriod.bind(this));
    this.addTest('Add period with invalid data', this.testAddInvalidPeriod.bind(this));

    // Cycle calculation tests
    this.addTest('Calculate average cycle length with multiple periods', this.testCalculateAverageCycleLength.bind(this));
    this.addTest('Calculate days until next period', this.testCalculateDaysUntilNextPeriod.bind(this));
    this.addTest('Handle single period calculation', this.testSinglePeriodCalculation.bind(this));
    this.addTest('Handle irregular cycle lengths', this.testIrregularCycleLengths.bind(this));

    // Phase detection tests
    this.addTest('Detect menstrual phase correctly', this.testMenstrualPhaseDetection.bind(this));
    this.addTest('Detect follicular phase correctly', this.testFollicularPhaseDetection.bind(this));
    this.addTest('Detect ovulation phase correctly', this.testOvulationPhaseDetection.bind(this));
    this.addTest('Detect luteal phase correctly', this.testLutealPhaseDetection.bind(this));

    // Daily log functionality tests
    this.addTest('Add new daily log', this.testAddDailyLog.bind(this));
    this.addTest('Update existing daily log for same date', this.testUpdateDailyLog.bind(this));
    this.addTest('Retrieve daily log by date', this.testRetrieveDailyLog.bind(this));
    this.addTest('Handle missing daily log', this.testMissingDailyLog.bind(this));

    // Symptom tracking tests
    this.addTest('Add symptom with date', this.testAddSymptom.bind(this));
    this.addTest('Retrieve symptoms by date', this.testRetrieveSymptomsByDate.bind(this));
    this.addTest('Handle multiple symptoms same date', this.testMultipleSymptomsPerDate.bind(this));
    this.addTest('Handle no symptoms for date', this.testNoSymptomsForDate.bind(this));

    // Cycle predictions tests
    this.addTest('Generate cycle predictions', this.testCyclePredictions.bind(this));
    this.addTest('Handle predictions with no data', this.testPredictionsWithNoData.bind(this));
    this.addTest('Validate prediction date calculations', this.testPredictionDateCalculations.bind(this));

    // Cycle settings tests
    this.addTest('Update cycle settings', this.testUpdateCycleSettings.bind(this));
    this.addTest('Persist cycle settings', this.testPersistCycleSettings.bind(this));

    // Data persistence and loading tests
    this.addTest('Load persisted cycle data', this.testLoadPersistedData.bind(this));
    this.addTest('Handle corrupted storage data', this.testCorruptedStorageData.bind(this));
    this.addTest('Handle empty storage', this.testEmptyStorage.bind(this));

    // Edge cases
    this.addTest('Handle future period dates', this.testFuturePeriodDates.bind(this));
    this.addTest('Handle very short cycles', this.testVeryShortCycles.bind(this));
    this.addTest('Handle very long cycles', this.testVeryLongCycles.bind(this));
    this.addTest('Handle date boundary conditions', this.testDateBoundaryConditions.bind(this));
  }

  // Reset mock context before each test
  async resetTest() {
    this.mockCycleContext.reset();
  }

  // Period tracking tests
  async testAddPeriod() {
    await this.resetTest();
    
    const periodData = {
      startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
      endDate: moment().subtract(3, 'days').format('YYYY-MM-DD'),
      flowIntensity: 'medium',
      symptoms: ['cramps', 'fatigue'],
      notes: 'Test period',
    };

    const result = await this.mockCycleContext.addPeriod(periodData);
    
    TestAssertion.assertTrue(result.success, 'Period should be added successfully');
    TestAssertion.assertExists(result.period, 'Period object should be returned');
    TestAssertion.assertEqual(result.period.startDate, periodData.startDate, 'Start date should match');
    TestAssertion.assertEqual(this.mockCycleContext.periods.length, 1, 'Should have one period');
  }

  async testUpdatePeriod() {
    await this.resetTest();
    
    // First add a period
    const periodData = {
      startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
      endDate: moment().subtract(3, 'days').format('YYYY-MM-DD'),
      flowIntensity: 'light',
    };
    
    const addResult = await this.mockCycleContext.addPeriod(periodData);
    const periodId = addResult.period.id;
    
    // Update the period
    const updates = { flowIntensity: 'heavy', notes: 'Updated notes' };
    const updateResult = await this.mockCycleContext.updatePeriod(periodId, updates);
    
    TestAssertion.assertTrue(updateResult.success, 'Period should be updated successfully');
    
    const updatedPeriod = this.mockCycleContext.periods.find(p => p.id === periodId);
    TestAssertion.assertEqual(updatedPeriod.flowIntensity, 'heavy', 'Flow intensity should be updated');
    TestAssertion.assertEqual(updatedPeriod.notes, 'Updated notes', 'Notes should be updated');
  }

  async testDeletePeriod() {
    await this.resetTest();
    
    // Add a period first
    const periodData = {
      startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
      endDate: moment().subtract(3, 'days').format('YYYY-MM-DD'),
    };
    
    const addResult = await this.mockCycleContext.addPeriod(periodData);
    const periodId = addResult.period.id;
    
    TestAssertion.assertEqual(this.mockCycleContext.periods.length, 1, 'Should have one period before deletion');
    
    // Delete the period
    const deleteResult = await this.mockCycleContext.deletePeriod(periodId);
    
    TestAssertion.assertTrue(deleteResult.success, 'Period should be deleted successfully');
    TestAssertion.assertEqual(this.mockCycleContext.periods.length, 0, 'Should have no periods after deletion');
  }

  async testAddInvalidPeriod() {
    await this.resetTest();
    
    // Test with null data - should not crash
    const result = await this.mockCycleContext.addPeriod(null);
    TestAssertion.assertExists(result, 'Result should exist even with invalid data');
  }

  // Cycle calculation tests
  async testCalculateAverageCycleLength() {
    await this.resetTest();
    
    // Add multiple periods with known cycle lengths
    const periods = [
      { startDate: moment().subtract(84, 'days').format('YYYY-MM-DD') }, // 84 days ago
      { startDate: moment().subtract(56, 'days').format('YYYY-MM-DD') }, // 56 days ago (28 day cycle)
      { startDate: moment().subtract(28, 'days').format('YYYY-MM-DD') }, // 28 days ago (28 day cycle)
      { startDate: moment().format('YYYY-MM-DD') }, // today (28 day cycle)
    ];
    
    for (const period of periods) {
      await this.mockCycleContext.addPeriod(period);
    }
    
    this.mockCycleContext.calculateCycleInfo();
    
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.averageCycleLength, 28, 'Average cycle length should be 28 days');
  }

  async testCalculateDaysUntilNextPeriod() {
    await this.resetTest();
    
    const lastPeriodDate = moment().subtract(14, 'days').format('YYYY-MM-DD');
    await this.mockCycleContext.addPeriod({ startDate: lastPeriodDate });
    
    this.mockCycleContext.calculateCycleInfo();
    
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.daysUntilNextPeriod, 14, 'Should be 14 days until next period');
    TestAssertion.assertExists(this.mockCycleContext.cycleData.nextPeriodDate, 'Next period date should be calculated');
  }

  async testSinglePeriodCalculation() {
    await this.resetTest();
    
    const lastPeriodDate = moment().subtract(10, 'days').format('YYYY-MM-DD');
    await this.mockCycleContext.addPeriod({ startDate: lastPeriodDate });
    
    this.mockCycleContext.calculateCycleInfo();
    
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.averageCycleLength, 28, 'Should use default cycle length with single period');
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.cycleDay, 11, 'Cycle day should be calculated correctly');
  }

  async testIrregularCycleLengths() {
    await this.resetTest();
    
    // Add periods with irregular cycle lengths (25, 32, 29 days)
    const periods = [
      { startDate: moment().subtract(86, 'days').format('YYYY-MM-DD') },
      { startDate: moment().subtract(54, 'days').format('YYYY-MM-DD') }, // 32 day cycle
      { startDate: moment().subtract(25, 'days').format('YYYY-MM-DD') }, // 29 day cycle
      { startDate: moment().format('YYYY-MM-DD') }, // 25 day cycle
    ];
    
    for (const period of periods) {
      await this.mockCycleContext.addPeriod(period);
    }
    
    this.mockCycleContext.calculateCycleInfo();
    
    // Average should be approximately (32 + 29 + 25) / 3 = 28.67, rounded to 29
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.averageCycleLength, 29, 'Should calculate average of irregular cycles');
  }

  // Phase detection tests
  async testMenstrualPhaseDetection() {
    await this.resetTest();
    
    const lastPeriodDate = moment().subtract(2, 'days').format('YYYY-MM-DD');
    await this.mockCycleContext.addPeriod({ startDate: lastPeriodDate });
    
    this.mockCycleContext.calculateCycleInfo();
    
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.currentPhase, 'menstrual', 'Should detect menstrual phase');
  }

  async testFollicularPhaseDetection() {
    await this.resetTest();
    
    const lastPeriodDate = moment().subtract(8, 'days').format('YYYY-MM-DD');
    await this.mockCycleContext.addPeriod({ startDate: lastPeriodDate });
    
    this.mockCycleContext.calculateCycleInfo();
    
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.currentPhase, 'follicular', 'Should detect follicular phase');
  }

  async testOvulationPhaseDetection() {
    await this.resetTest();
    
    const lastPeriodDate = moment().subtract(14, 'days').format('YYYY-MM-DD');
    await this.mockCycleContext.addPeriod({ startDate: lastPeriodDate });
    
    this.mockCycleContext.calculateCycleInfo();
    
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.currentPhase, 'ovulation', 'Should detect ovulation phase');
  }

  async testLutealPhaseDetection() {
    await this.resetTest();
    
    const lastPeriodDate = moment().subtract(20, 'days').format('YYYY-MM-DD');
    await this.mockCycleContext.addPeriod({ startDate: lastPeriodDate });
    
    this.mockCycleContext.calculateCycleInfo();
    
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.currentPhase, 'luteal', 'Should detect luteal phase');
  }

  // Daily log functionality tests
  async testAddDailyLog() {
    await this.resetTest();
    
    const logData = {
      flow: 'medium',
      mood: 'happy',
      symptoms: ['mild cramps'],
      temperature: 36.5,
      notes: 'Feeling good',
    };
    
    const result = await this.mockCycleContext.addDailyLog(logData);
    
    TestAssertion.assertTrue(result.success, 'Daily log should be added successfully');
    TestAssertion.assertEqual(this.mockCycleContext.dailyLogs.length, 1, 'Should have one daily log');
  }

  async testUpdateDailyLog() {
    await this.resetTest();
    
    const date = moment().format('YYYY-MM-DD');
    const initialLog = { date, flow: 'light', mood: 'neutral' };
    
    await this.mockCycleContext.addDailyLog(initialLog);
    
    // Update the same date
    const updatedLog = { date, flow: 'heavy', mood: 'happy', temperature: 36.8 };
    await this.mockCycleContext.addDailyLog(updatedLog);
    
    TestAssertion.assertEqual(this.mockCycleContext.dailyLogs.length, 1, 'Should still have only one log for the date');
    
    const log = this.mockCycleContext.getDailyLog(date);
    TestAssertion.assertEqual(log.flow, 'heavy', 'Flow should be updated');
    TestAssertion.assertEqual(log.mood, 'happy', 'Mood should be updated');
    TestAssertion.assertEqual(log.temperature, 36.8, 'Temperature should be added');
  }

  async testRetrieveDailyLog() {
    await this.resetTest();
    
    const date = moment().format('YYYY-MM-DD');
    const logData = { date, flow: 'medium', mood: 'happy' };
    
    await this.mockCycleContext.addDailyLog(logData);
    
    const retrievedLog = this.mockCycleContext.getDailyLog(date);
    
    TestAssertion.assertExists(retrievedLog, 'Should retrieve daily log');
    TestAssertion.assertEqual(retrievedLog.flow, 'medium', 'Flow should match');
    TestAssertion.assertEqual(retrievedLog.mood, 'happy', 'Mood should match');
  }

  async testMissingDailyLog() {
    await this.resetTest();
    
    const date = moment().subtract(1, 'day').format('YYYY-MM-DD');
    const retrievedLog = this.mockCycleContext.getDailyLog(date);
    
    TestAssertion.assertEqual(retrievedLog, undefined, 'Should return undefined for missing log');
  }

  // Symptom tracking tests
  async testAddSymptom() {
    await this.resetTest();
    
    const symptomData = {
      type: 'cramps',
      severity: 'mild',
      notes: 'Light cramping in morning',
    };
    
    const result = await this.mockCycleContext.addSymptom(symptomData);
    
    TestAssertion.assertTrue(result.success, 'Symptom should be added successfully');
    TestAssertion.assertExists(result.symptom, 'Symptom object should be returned');
    TestAssertion.assertEqual(result.symptom.type, 'cramps', 'Symptom type should match');
    TestAssertion.assertEqual(this.mockCycleContext.symptoms.length, 1, 'Should have one symptom');
  }

  async testRetrieveSymptomsByDate() {
    await this.resetTest();
    
    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
    
    // Add symptoms for today
    await this.mockCycleContext.addSymptom({ date: today, type: 'cramps' });
    await this.mockCycleContext.addSymptom({ date: today, type: 'fatigue' });
    
    // Add symptom for yesterday
    await this.mockCycleContext.addSymptom({ date: yesterday, type: 'headache' });
    
    const todaySymptoms = this.mockCycleContext.getSymptomsByDate(today);
    const yesterdaySymptoms = this.mockCycleContext.getSymptomsByDate(yesterday);
    
    TestAssertion.assertEqual(todaySymptoms.length, 2, 'Should have 2 symptoms for today');
    TestAssertion.assertEqual(yesterdaySymptoms.length, 1, 'Should have 1 symptom for yesterday');
  }

  async testMultipleSymptomsPerDate() {
    await this.resetTest();
    
    const date = moment().format('YYYY-MM-DD');
    
    await this.mockCycleContext.addSymptom({ date, type: 'cramps', severity: 'mild' });
    await this.mockCycleContext.addSymptom({ date, type: 'bloating', severity: 'moderate' });
    await this.mockCycleContext.addSymptom({ date, type: 'mood_swings', severity: 'severe' });
    
    const symptoms = this.mockCycleContext.getSymptomsByDate(date);
    
    TestAssertion.assertEqual(symptoms.length, 3, 'Should have 3 symptoms for the date');
    TestAssertion.assertTrue(symptoms.some(s => s.type === 'cramps'), 'Should include cramps');
    TestAssertion.assertTrue(symptoms.some(s => s.type === 'bloating'), 'Should include bloating');
    TestAssertion.assertTrue(symptoms.some(s => s.type === 'mood_swings'), 'Should include mood swings');
  }

  async testNoSymptomsForDate() {
    await this.resetTest();
    
    const date = moment().subtract(1, 'day').format('YYYY-MM-DD');
    const symptoms = this.mockCycleContext.getSymptomsByDate(date);
    
    TestAssertion.assertEqual(symptoms.length, 0, 'Should return empty array for date with no symptoms');
  }

  // Cycle predictions tests
  async testCyclePredictions() {
    await this.resetTest();
    
    // Set up cycle data with a known next period date
    this.mockCycleContext.cycleData = {
      ...this.mockCycleContext.cycleData,
      nextPeriodDate: moment().add(14, 'days').format('YYYY-MM-DD'),
      averageCycleLength: 28,
      averagePeriodLength: 5,
    };
    
    const predictions = this.mockCycleContext.getPredictions();
    
    TestAssertion.assertEqual(predictions.length, 3, 'Should generate 3 cycle predictions');
    
    // Check first prediction
    const firstPrediction = predictions[0];
    TestAssertion.assertExists(firstPrediction.periodStart, 'First prediction should have period start date');
    TestAssertion.assertExists(firstPrediction.periodEnd, 'First prediction should have period end date');
    TestAssertion.assertExists(firstPrediction.ovulationDate, 'First prediction should have ovulation date');
    TestAssertion.assertExists(firstPrediction.fertileWindowStart, 'First prediction should have fertile window start');
    TestAssertion.assertExists(firstPrediction.fertileWindowEnd, 'First prediction should have fertile window end');
  }

  async testPredictionsWithNoData() {
    await this.resetTest();
    
    // Don't set next period date
    const predictions = this.mockCycleContext.getPredictions();
    
    TestAssertion.assertEqual(predictions.length, 0, 'Should return empty predictions with no data');
  }

  async testPredictionDateCalculations() {
    await this.resetTest();
    
    const nextPeriodDate = moment().add(7, 'days');
    this.mockCycleContext.cycleData = {
      ...this.mockCycleContext.cycleData,
      nextPeriodDate: nextPeriodDate.format('YYYY-MM-DD'),
      averageCycleLength: 28,
      averagePeriodLength: 5,
    };
    
    const predictions = this.mockCycleContext.getPredictions();
    const firstPrediction = predictions[0];
    
    TestAssertion.assertEqual(firstPrediction.periodStart, nextPeriodDate.format('YYYY-MM-DD'), 'First prediction period start should match next period date');
    
    const expectedPeriodEnd = nextPeriodDate.clone().add(4, 'days').format('YYYY-MM-DD');
    TestAssertion.assertEqual(firstPrediction.periodEnd, expectedPeriodEnd, 'Period end should be calculated correctly');
    
    const expectedOvulation = nextPeriodDate.clone().subtract(14, 'days').format('YYYY-MM-DD');
    TestAssertion.assertEqual(firstPrediction.ovulationDate, expectedOvulation, 'Ovulation date should be calculated correctly');
  }

  // Cycle settings tests
  async testUpdateCycleSettings() {
    await this.resetTest();
    
    const newSettings = {
      averageCycleLength: 30,
      averagePeriodLength: 6,
    };
    
    const result = await this.mockCycleContext.updateCycleSettings(newSettings);
    
    TestAssertion.assertTrue(result.success, 'Cycle settings should be updated successfully');
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.averageCycleLength, 30, 'Average cycle length should be updated');
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.averagePeriodLength, 6, 'Average period length should be updated');
  }

  async testPersistCycleSettings() {
    await this.resetTest();
    
    const newSettings = { averageCycleLength: 32 };
    await this.mockCycleContext.updateCycleSettings(newSettings);
    
    // Verify settings are persisted in storage
    const storedSettings = await this.mockCycleContext.storage.getItem('cycleSettings');
    const parsedSettings = JSON.parse(storedSettings);
    
    TestAssertion.assertEqual(parsedSettings.averageCycleLength, 32, 'Settings should be persisted in storage');
  }

  // Data persistence and loading tests
  async testLoadPersistedData() {
    await this.resetTest();
    
    // Set up mock data in storage
    const mockPeriods = [{ id: '1', startDate: '2024-01-01' }];
    const mockSymptoms = [{ id: '1', type: 'cramps', date: '2024-01-01' }];
    const mockLogs = [{ id: '1', date: '2024-01-01', flow: 'medium' }];
    const mockSettings = { averageCycleLength: 30 };
    
    await this.mockCycleContext.storage.setItem('periods', JSON.stringify(mockPeriods));
    await this.mockCycleContext.storage.setItem('symptoms', JSON.stringify(mockSymptoms));
    await this.mockCycleContext.storage.setItem('dailyLogs', JSON.stringify(mockLogs));
    await this.mockCycleContext.storage.setItem('cycleSettings', JSON.stringify(mockSettings));
    
    // Load data
    await this.mockCycleContext.loadCycleData();
    
    TestAssertion.assertEqual(this.mockCycleContext.periods.length, 1, 'Should load periods');
    TestAssertion.assertEqual(this.mockCycleContext.symptoms.length, 1, 'Should load symptoms');
    TestAssertion.assertEqual(this.mockCycleContext.dailyLogs.length, 1, 'Should load daily logs');
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.averageCycleLength, 30, 'Should load cycle settings');
  }

  async testCorruptedStorageData() {
    await this.resetTest();
    
    // Set corrupted JSON data
    await this.mockCycleContext.storage.setItem('periods', 'invalid json');
    
    // Should not crash when loading corrupted data
    await this.mockCycleContext.loadCycleData();
    
    TestAssertion.assertEqual(this.mockCycleContext.periods.length, 0, 'Should handle corrupted data gracefully');
  }

  async testEmptyStorage() {
    await this.resetTest();
    
    // Load data from empty storage
    await this.mockCycleContext.loadCycleData();
    
    TestAssertion.assertEqual(this.mockCycleContext.periods.length, 0, 'Should handle empty storage');
    TestAssertion.assertEqual(this.mockCycleContext.symptoms.length, 0, 'Should handle empty storage');
    TestAssertion.assertEqual(this.mockCycleContext.dailyLogs.length, 0, 'Should handle empty storage');
  }

  // Edge cases
  async testFuturePeriodDates() {
    await this.resetTest();
    
    const futurePeriodDate = moment().add(7, 'days').format('YYYY-MM-DD');
    await this.mockCycleContext.addPeriod({ startDate: futurePeriodDate });
    
    this.mockCycleContext.calculateCycleInfo();
    
    // Should handle future dates without crashing
    TestAssertion.assertExists(this.mockCycleContext.cycleData.cycleDay, 'Cycle day should be calculated even with future dates');
  }

  async testVeryShortCycles() {
    await this.resetTest();
    
    // Add periods with 21-day cycles
    const periods = [
      { startDate: moment().subtract(42, 'days').format('YYYY-MM-DD') },
      { startDate: moment().subtract(21, 'days').format('YYYY-MM-DD') },
      { startDate: moment().format('YYYY-MM-DD') },
    ];
    
    for (const period of periods) {
      await this.mockCycleContext.addPeriod(period);
    }
    
    this.mockCycleContext.calculateCycleInfo();
    
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.averageCycleLength, 21, 'Should handle short cycles');
  }

  async testVeryLongCycles() {
    await this.resetTest();
    
    // Add periods with 45-day cycles
    const periods = [
      { startDate: moment().subtract(90, 'days').format('YYYY-MM-DD') },
      { startDate: moment().subtract(45, 'days').format('YYYY-MM-DD') },
      { startDate: moment().format('YYYY-MM-DD') },
    ];
    
    for (const period of periods) {
      await this.mockCycleContext.addPeriod(period);
    }
    
    this.mockCycleContext.calculateCycleInfo();
    
    TestAssertion.assertEqual(this.mockCycleContext.cycleData.averageCycleLength, 45, 'Should handle long cycles');
  }

  async testDateBoundaryConditions() {
    await this.resetTest();
    
    // Test with various date formats and edge cases
    const testDates = [
      moment().startOf('year').format('YYYY-MM-DD'), // Start of year
      moment().endOf('year').format('YYYY-MM-DD'), // End of year
      moment().startOf('month').format('YYYY-MM-DD'), // Start of month
      moment().endOf('month').format('YYYY-MM-DD'), // End of month
    ];
    
    for (const date of testDates) {
      const logResult = await this.mockCycleContext.addDailyLog({ date, flow: 'medium' });
      TestAssertion.assertTrue(logResult.success, `Should handle date boundary: ${date}`);
      
      const retrievedLog = this.mockCycleContext.getDailyLog(date);
      TestAssertion.assertExists(retrievedLog, `Should retrieve log for boundary date: ${date}`);
    }
  }
}

/**
 * Export function to create and run cycle tests
 */
export async function runCycleTests() {
  const testAgent = new CycleTestAgent();
  return await testAgent.run();
}

/**
 * Export factory function for test runner integration
 */
export function createCycleTestAgent() {
  return new CycleTestAgent();
}

export default CycleTestAgent;