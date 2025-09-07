// Test Framework for CareSync App
// This framework provides utilities for testing various components

export class TestRunner {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  addTest(testName, testFunction) {
    this.tests.push({ name: testName, fn: testFunction });
  }

  async run() {
    console.log(`\n🧪 Running ${this.name} Tests...`);
    console.log('=' .repeat(50));

    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        this.results.push({ name: test.name, status: 'PASSED', error: null });
        console.log(`✅ ${test.name}: PASSED`);
      } catch (error) {
        this.failed++;
        this.results.push({ name: test.name, status: 'FAILED', error: error.message });
        console.log(`❌ ${test.name}: FAILED - ${error.message}`);
      }
    }

    this.printSummary();
    return this.results;
  }

  printSummary() {
    console.log('\n' + '=' .repeat(50));
    console.log(`📊 Test Summary for ${this.name}:`);
    console.log(`   Total: ${this.tests.length}`);
    console.log(`   ✅ Passed: ${this.passed}`);
    console.log(`   ❌ Failed: ${this.failed}`);
    console.log(`   Success Rate: ${((this.passed / this.tests.length) * 100).toFixed(1)}%`);
    console.log('=' .repeat(50) + '\n');
  }
}

export class TestAssertion {
  static assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${expected}, but got ${actual}`
      );
    }
  }

  static assertNotEqual(actual, expected, message = '') {
    if (actual === expected) {
      throw new Error(
        message || `Expected not to equal ${expected}`
      );
    }
  }

  static assertTrue(value, message = '') {
    if (!value) {
      throw new Error(message || `Expected true, but got ${value}`);
    }
  }

  static assertFalse(value, message = '') {
    if (value) {
      throw new Error(message || `Expected false, but got ${value}`);
    }
  }

  static assertExists(value, message = '') {
    if (value === null || value === undefined) {
      throw new Error(message || `Expected value to exist, but got ${value}`);
    }
  }

  static assertType(value, expectedType, message = '') {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw new Error(
        message || `Expected type ${expectedType}, but got ${actualType}`
      );
    }
  }

  static assertArrayLength(array, expectedLength, message = '') {
    if (!Array.isArray(array)) {
      throw new Error('Value is not an array');
    }
    if (array.length !== expectedLength) {
      throw new Error(
        message || `Expected array length ${expectedLength}, but got ${array.length}`
      );
    }
  }

  static assertObjectHasProperty(obj, property, message = '') {
    if (!obj.hasOwnProperty(property)) {
      throw new Error(
        message || `Object does not have property '${property}'`
      );
    }
  }

  static async assertAsyncFunction(fn, message = '') {
    try {
      await fn();
    } catch (error) {
      throw new Error(
        message || `Async function failed: ${error.message}`
      );
    }
  }

  static assertDateValid(date, message = '') {
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error(message || `Invalid date: ${date}`);
    }
  }
}

export class MockStorage {
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

export class TestUtilities {
  static generateMockUser(role = 'tracker') {
    return {
      id: Date.now().toString(),
      name: 'Test User',
      email: 'test@example.com',
      role: role,
      createdAt: new Date().toISOString(),
    };
  }

  static generateMockPeriod(startDate = new Date()) {
    return {
      id: Date.now().toString(),
      startDate: startDate.toISOString(),
      endDate: new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      flowIntensity: 'medium',
      symptoms: ['cramps', 'fatigue'],
      notes: 'Test period',
    };
  }

  static generateMockCycleData() {
    return {
      averageCycleLength: 28,
      averagePeriodLength: 5,
      lastPeriodDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      nextPeriodDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      currentPhase: 'follicular',
      daysUntilNextPeriod: 14,
      cycleDay: 14,
    };
  }

  static generateMockDailyLog(date = new Date()) {
    return {
      id: Date.now().toString(),
      date: date.toISOString().split('T')[0],
      flow: 'light',
      mood: 'happy',
      symptoms: ['mild cramps'],
      temperature: 36.5,
      notes: 'Feeling good today',
      createdAt: new Date().toISOString(),
    };
  }

  static async waitFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static formatTestDate(date) {
    return date.toISOString().split('T')[0];
  }
}

// Export a function to run all test suites
export async function runAllTests(testAgents) {
  console.log('\n🚀 Starting Comprehensive Test Suite for CareSync App');
  console.log('=' .repeat(60));
  
  const allResults = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const agent of testAgents) {
    const results = await agent.run();
    allResults.push({ agent: agent.name, results });
    totalPassed += agent.passed;
    totalFailed += agent.failed;
  }

  // Print final summary
  console.log('\n' + '=' .repeat(60));
  console.log('📈 FINAL TEST REPORT');
  console.log('=' .repeat(60));
  console.log(`Total Test Suites: ${testAgents.length}`);
  console.log(`Total Tests Run: ${totalPassed + totalFailed}`);
  console.log(`✅ Total Passed: ${totalPassed}`);
  console.log(`❌ Total Failed: ${totalFailed}`);
  console.log(`Overall Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  console.log('=' .repeat(60) + '\n');

  return {
    success: totalFailed === 0,
    totalPassed,
    totalFailed,
    details: allResults,
  };
}