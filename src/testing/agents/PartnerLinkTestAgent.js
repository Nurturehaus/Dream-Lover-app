// Partner Link Test Agent for CareSync App
// Comprehensive testing for partner linking functionality

import { TestRunner, TestAssertion, MockStorage } from '../TestFramework.js';

/**
 * Mock AsyncStorage implementation for testing
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
 * Mock Partner Context for isolated testing
 */
class MockPartnerContext {
  constructor(mockStorage = new MockAsyncStorage()) {
    this.storage = mockStorage;
    this.user = null;
    this.partners = [];
    this.isLoading = false;
  }

  // Reset all state for test isolation
  reset() {
    this.storage.clear();
    this.user = null;
    this.partners = [];
    this.isLoading = false;
  }

  // Set up a test user
  async setTestUser(userData) {
    this.user = {
      id: Date.now().toString(),
      name: 'Test User',
      email: 'test@example.com',
      role: 'tracker',
      ...userData
    };
    await this.storage.setItem('userData', JSON.stringify(this.user));
  }

  // Generate partner code
  generatePartnerCode() {
    if (!this.user) return null;
    return `${this.user.id}-${Date.now()}`.slice(-8).toUpperCase();
  }

  // Validate partner code format
  validatePartnerCodeFormat(code) {
    if (!code) return false;
    if (typeof code !== 'string') return false;
    if (code.length < 6 || code.length > 20) return false;
    // Check for basic alphanumeric characters
    return /^[A-Z0-9-]+$/.test(code);
  }

  // Validate QR code format
  validateQRCodeFormat(qrData) {
    if (!qrData || typeof qrData !== 'string') return false;
    return qrData.startsWith('CARESYNC:') && qrData.length > 9;
  }

  // Extract partner code from QR code
  extractPartnerCodeFromQR(qrData) {
    if (!this.validateQRCodeFormat(qrData)) return null;
    return qrData.replace('CARESYNC:', '');
  }

  // Check for duplicate partners
  isDuplicatePartner(partnerCode) {
    return this.partners.some(partner => partner.code === partnerCode);
  }

  // Add partner functionality
  async addPartner(partnerCode) {
    try {
      // Validate partner code format
      if (!this.validatePartnerCodeFormat(partnerCode)) {
        return { success: false, error: 'Invalid partner code format' };
      }

      // Check if user is trying to add themselves
      const myCode = this.generatePartnerCode();
      if (partnerCode === myCode) {
        return { success: false, error: 'Cannot add yourself as a partner' };
      }

      // Check for duplicates
      if (this.isDuplicatePartner(partnerCode)) {
        return { success: false, error: 'Partner already connected' };
      }

      // Check partner limit (max 5 partners for testing)
      if (this.partners.length >= 5) {
        return { success: false, error: 'Maximum number of partners reached' };
      }

      // Create new partner
      const newPartner = {
        id: Date.now().toString(),
        code: partnerCode,
        name: `Partner ${partnerCode.slice(-4)}`, // Mock partner name
        connectedAt: new Date().toISOString(),
        status: 'active'
      };

      this.partners.push(newPartner);
      await this.storage.setItem('partners', JSON.stringify(this.partners));

      return { success: true, partner: newPartner };
    } catch (error) {
      console.error('Error adding partner:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove partner functionality
  async removePartner(partnerId) {
    try {
      if (!partnerId) {
        return { success: false, error: 'Partner ID is required' };
      }

      const partnerIndex = this.partners.findIndex(p => p.id === partnerId);
      if (partnerIndex === -1) {
        return { success: false, error: 'Partner not found' };
      }

      this.partners.splice(partnerIndex, 1);
      await this.storage.setItem('partners', JSON.stringify(this.partners));

      return { success: true };
    } catch (error) {
      console.error('Error removing partner:', error);
      return { success: false, error: error.message };
    }
  }

  // Load partners from storage
  async loadPartners() {
    try {
      const partnersData = await this.storage.getItem('partners');
      if (partnersData) {
        this.partners = JSON.parse(partnersData);
      }
    } catch (error) {
      console.error('Error loading partners:', error);
      this.partners = [];
    }
  }
}

/**
 * Partner Link Test Agent
 * Tests all partner linking functionality including QR codes, validation, and management
 */
export class PartnerLinkTestAgent extends TestRunner {
  constructor() {
    super('Partner Link Test Agent');
    this.mockStorage = new MockAsyncStorage();
    this.partnerContext = new MockPartnerContext(this.mockStorage);
    this.setupTests();
  }

  setupTests() {
    // QR Code Generation Tests
    this.addTest('QR Code Generation - Valid Format', async () => {
      await this.testQRCodeGeneration();
    });

    this.addTest('QR Code Generation - Consistent Results', async () => {
      await this.testQRCodeGenerationConsistency();
    });

    // Partner Code Validation Tests
    this.addTest('Partner Code Validation - Valid Codes', async () => {
      await this.testValidPartnerCodes();
    });

    this.addTest('Partner Code Validation - Invalid Codes', async () => {
      await this.testInvalidPartnerCodes();
    });

    this.addTest('Partner Code Validation - Edge Cases', async () => {
      await this.testPartnerCodeEdgeCases();
    });

    // QR Code Validation Tests
    this.addTest('QR Code Validation - Valid QR Codes', async () => {
      await this.testValidQRCodes();
    });

    this.addTest('QR Code Validation - Invalid QR Codes', async () => {
      await this.testInvalidQRCodes();
    });

    this.addTest('QR Code Validation - Code Extraction', async () => {
      await this.testQRCodeExtraction();
    });

    // Adding Partners Tests
    this.addTest('Add Partner - Valid Code Success', async () => {
      await this.testAddPartnerSuccess();
    });

    this.addTest('Add Partner - Invalid Code Rejection', async () => {
      await this.testAddPartnerInvalidCode();
    });

    this.addTest('Add Partner - Self Addition Prevention', async () => {
      await this.testPreventSelfAddition();
    });

    // Manual Code Entry Tests
    this.addTest('Manual Code Entry - Valid Input', async () => {
      await this.testManualCodeEntryValid();
    });

    this.addTest('Manual Code Entry - Invalid Input', async () => {
      await this.testManualCodeEntryInvalid();
    });

    this.addTest('Manual Code Entry - Whitespace Handling', async () => {
      await this.testManualCodeWhitespace();
    });

    // Partner Removal Tests
    this.addTest('Remove Partner - Valid Partner', async () => {
      await this.testRemovePartnerValid();
    });

    this.addTest('Remove Partner - Nonexistent Partner', async () => {
      await this.testRemovePartnerNonexistent();
    });

    this.addTest('Remove Partner - Invalid ID', async () => {
      await this.testRemovePartnerInvalidId();
    });

    // Multiple Partner Support Tests
    this.addTest('Multiple Partners - Add Multiple', async () => {
      await this.testMultiplePartnersAdd();
    });

    this.addTest('Multiple Partners - Partner Limit', async () => {
      await this.testPartnerLimit();
    });

    this.addTest('Multiple Partners - Partner List Management', async () => {
      await this.testPartnerListManagement();
    });

    // Duplicate Partner Prevention Tests
    this.addTest('Duplicate Prevention - Same Code Twice', async () => {
      await this.testDuplicatePreventionSameCode();
    });

    this.addTest('Duplicate Prevention - Case Sensitivity', async () => {
      await this.testDuplicatePreventionCase();
    });

    this.addTest('Duplicate Prevention - After Removal and Re-add', async () => {
      await this.testDuplicatePreventionAfterRemoval();
    });

    // Data Persistence Tests
    this.addTest('Data Persistence - Partner Storage', async () => {
      await this.testPartnerDataPersistence();
    });

    this.addTest('Data Persistence - Storage Recovery', async () => {
      await this.testStorageRecovery();
    });

    // Error Handling Tests
    this.addTest('Error Handling - Storage Errors', async () => {
      await this.testStorageErrorHandling();
    });

    this.addTest('Error Handling - Network Simulation', async () => {
      await this.testNetworkErrorHandling();
    });
  }

  async beforeEach() {
    // Reset context before each test
    await this.partnerContext.reset();
    await this.partnerContext.setTestUser({
      id: '12345',
      name: 'Test User',
      email: 'test@example.com'
    });
  }

  // QR Code Generation Tests
  async testQRCodeGeneration() {
    await this.beforeEach();
    
    const partnerCode = this.partnerContext.generatePartnerCode();
    
    TestAssertion.assertExists(partnerCode, 'Partner code should be generated');
    TestAssertion.assertType(partnerCode, 'string', 'Partner code should be a string');
    TestAssertion.assertTrue(partnerCode.length > 0, 'Partner code should not be empty');
    TestAssertion.assertTrue(partnerCode.length <= 8, 'Partner code should be 8 characters or less');
    TestAssertion.assertTrue(/^[A-Z0-9-]+$/.test(partnerCode), 'Partner code should contain only uppercase letters, numbers, and dashes');
    
    // Test QR code format
    const qrData = `CARESYNC:${partnerCode}`;
    TestAssertion.assertTrue(this.partnerContext.validateQRCodeFormat(qrData), 'QR code should have valid format');
  }

  async testQRCodeGenerationConsistency() {
    await this.beforeEach();
    
    const code1 = this.partnerContext.generatePartnerCode();
    await new Promise(resolve => setTimeout(resolve, 2)); // Small delay to ensure timestamp difference
    const code2 = this.partnerContext.generatePartnerCode();
    
    TestAssertion.assertNotEqual(code1, code2, 'Generated codes should be unique');
    TestAssertion.assertTrue(code1.length > 0 && code2.length > 0, 'Both codes should be non-empty');
  }

  // Partner Code Validation Tests
  async testValidPartnerCodes() {
    await this.beforeEach();
    
    const validCodes = [
      'ABC123',
      'PARTNER1',
      'TEST-456',
      'USER789',
      '123456',
      'CODE-ABC-123'
    ];

    for (const code of validCodes) {
      TestAssertion.assertTrue(
        this.partnerContext.validatePartnerCodeFormat(code),
        `Code "${code}" should be valid`
      );
    }
  }

  async testInvalidPartnerCodes() {
    await this.beforeEach();
    
    const invalidCodes = [
      '',           // Empty string
      null,         // Null
      undefined,    // Undefined
      123,          // Number
      'ab',         // Too short
      'a'.repeat(25), // Too long
      'abc 123',    // Contains space
      'abc@123',    // Contains special characters
      'abc.123',    // Contains period
      'abc#123'     // Contains hash
    ];

    for (const code of invalidCodes) {
      TestAssertion.assertFalse(
        this.partnerContext.validatePartnerCodeFormat(code),
        `Code "${code}" should be invalid`
      );
    }
  }

  async testPartnerCodeEdgeCases() {
    await this.beforeEach();
    
    // Test minimum valid length
    TestAssertion.assertTrue(
      this.partnerContext.validatePartnerCodeFormat('ABC123'),
      'Minimum valid length should pass'
    );
    
    // Test maximum valid length
    TestAssertion.assertTrue(
      this.partnerContext.validatePartnerCodeFormat('ABCDEFGHIJ1234567890'),
      'Maximum valid length should pass'
    );
    
    // Test just over maximum length
    TestAssertion.assertFalse(
      this.partnerContext.validatePartnerCodeFormat('A'.repeat(21)),
      'Over maximum length should fail'
    );
  }

  // QR Code Validation Tests
  async testValidQRCodes() {
    await this.beforeEach();
    
    const validQRCodes = [
      'CARESYNC:ABC123',
      'CARESYNC:PARTNER1',
      'CARESYNC:TEST-456',
      'CARESYNC:12345678'
    ];

    for (const qrCode of validQRCodes) {
      TestAssertion.assertTrue(
        this.partnerContext.validateQRCodeFormat(qrCode),
        `QR code "${qrCode}" should be valid`
      );
    }
  }

  async testInvalidQRCodes() {
    await this.beforeEach();
    
    const invalidQRCodes = [
      'CARESYNC:',     // Empty code
      'INVALID:ABC123', // Wrong prefix
      'ABC123',        // No prefix
      '',              // Empty string
      null,            // Null
      undefined,       // Undefined
      'CARESYNC',      // No colon
      'caresync:ABC123' // Lowercase prefix
    ];

    for (const qrCode of invalidQRCodes) {
      TestAssertion.assertFalse(
        this.partnerContext.validateQRCodeFormat(qrCode),
        `QR code "${qrCode}" should be invalid`
      );
    }
  }

  async testQRCodeExtraction() {
    await this.beforeEach();
    
    const testCodes = [
      { qr: 'CARESYNC:ABC123', expected: 'ABC123' },
      { qr: 'CARESYNC:PARTNER1', expected: 'PARTNER1' },
      { qr: 'CARESYNC:TEST-456', expected: 'TEST-456' }
    ];

    for (const test of testCodes) {
      const extracted = this.partnerContext.extractPartnerCodeFromQR(test.qr);
      TestAssertion.assertEqual(extracted, test.expected, `Should extract "${test.expected}" from "${test.qr}"`);
    }

    // Test invalid QR codes return null
    const extracted = this.partnerContext.extractPartnerCodeFromQR('INVALID:CODE');
    TestAssertion.assertEqual(extracted, null, 'Invalid QR code should return null');
  }

  // Adding Partners Tests
  async testAddPartnerSuccess() {
    await this.beforeEach();
    
    const result = await this.partnerContext.addPartner('TEST123');
    
    TestAssertion.assertTrue(result.success, 'Adding valid partner should succeed');
    TestAssertion.assertExists(result.partner, 'Result should contain partner object');
    TestAssertion.assertEqual(result.partner.code, 'TEST123', 'Partner should have correct code');
    TestAssertion.assertExists(result.partner.id, 'Partner should have an ID');
    TestAssertion.assertExists(result.partner.connectedAt, 'Partner should have connection timestamp');
    TestAssertion.assertEqual(this.partnerContext.partners.length, 1, 'Partners array should contain one partner');
  }

  async testAddPartnerInvalidCode() {
    await this.beforeEach();
    
    const invalidCodes = ['', 'ab', null, undefined, 'invalid@code'];
    
    for (const code of invalidCodes) {
      const result = await this.partnerContext.addPartner(code);
      TestAssertion.assertFalse(result.success, `Adding invalid code "${code}" should fail`);
      TestAssertion.assertExists(result.error, 'Should provide error message');
    }
    
    TestAssertion.assertEqual(this.partnerContext.partners.length, 0, 'No partners should be added');
  }

  async testPreventSelfAddition() {
    await this.beforeEach();
    
    const myCode = this.partnerContext.generatePartnerCode();
    const result = await this.partnerContext.addPartner(myCode);
    
    TestAssertion.assertFalse(result.success, 'Adding own code should fail');
    TestAssertion.assertTrue(result.error.includes('yourself'), 'Error should mention self-addition');
    TestAssertion.assertEqual(this.partnerContext.partners.length, 0, 'No partners should be added');
  }

  // Manual Code Entry Tests
  async testManualCodeEntryValid() {
    await this.beforeEach();
    
    const testCodes = ['ABC123', 'PARTNER1', 'TEST-456'];
    
    for (const code of testCodes) {
      await this.partnerContext.reset();
      await this.partnerContext.setTestUser({ id: '12345' });
      
      const result = await this.partnerContext.addPartner(code);
      TestAssertion.assertTrue(result.success, `Manual entry of "${code}" should succeed`);
    }
  }

  async testManualCodeEntryInvalid() {
    await this.beforeEach();
    
    const invalidCodes = ['', '  ', 'ab', 'toolongpartnercode123456'];
    
    for (const code of invalidCodes) {
      const result = await this.partnerContext.addPartner(code);
      TestAssertion.assertFalse(result.success, `Manual entry of "${code}" should fail`);
    }
  }

  async testManualCodeWhitespace() {
    await this.beforeEach();
    
    // Test trimming would be handled by the UI, but test the context directly
    const result = await this.partnerContext.addPartner('ABC123');
    TestAssertion.assertTrue(result.success, 'Clean code should work');
    
    // Test that spaces in the middle are invalid
    await this.partnerContext.reset();
    await this.partnerContext.setTestUser({ id: '12345' });
    const spacedResult = await this.partnerContext.addPartner('ABC 123');
    TestAssertion.assertFalse(spacedResult.success, 'Code with spaces should be invalid');
  }

  // Partner Removal Tests
  async testRemovePartnerValid() {
    await this.beforeEach();
    
    // First add a partner
    const addResult = await this.partnerContext.addPartner('TEST123');
    TestAssertion.assertTrue(addResult.success, 'Should add partner first');
    
    const partnerId = addResult.partner.id;
    const removeResult = await this.partnerContext.removePartner(partnerId);
    
    TestAssertion.assertTrue(removeResult.success, 'Should successfully remove partner');
    TestAssertion.assertEqual(this.partnerContext.partners.length, 0, 'Partners array should be empty');
  }

  async testRemovePartnerNonexistent() {
    await this.beforeEach();
    
    const result = await this.partnerContext.removePartner('nonexistent-id');
    
    TestAssertion.assertFalse(result.success, 'Removing nonexistent partner should fail');
    TestAssertion.assertTrue(result.error.includes('not found'), 'Error should mention partner not found');
  }

  async testRemovePartnerInvalidId() {
    await this.beforeEach();
    
    const invalidIds = [null, undefined, '', 123];
    
    for (const id of invalidIds) {
      const result = await this.partnerContext.removePartner(id);
      TestAssertion.assertFalse(result.success, `Removing with invalid ID "${id}" should fail`);
    }
  }

  // Multiple Partner Support Tests
  async testMultiplePartnersAdd() {
    await this.beforeEach();
    
    const codes = ['PARTNER1', 'PARTNER2', 'PARTNER3'];
    
    for (let i = 0; i < codes.length; i++) {
      const result = await this.partnerContext.addPartner(codes[i]);
      TestAssertion.assertTrue(result.success, `Should add partner ${i + 1}`);
      TestAssertion.assertEqual(this.partnerContext.partners.length, i + 1, `Should have ${i + 1} partners`);
    }
    
    // Verify all partners are stored correctly
    for (let i = 0; i < codes.length; i++) {
      TestAssertion.assertEqual(this.partnerContext.partners[i].code, codes[i], `Partner ${i} should have correct code`);
    }
  }

  async testPartnerLimit() {
    await this.beforeEach();
    
    // Add 5 partners (the limit)
    for (let i = 1; i <= 5; i++) {
      const result = await this.partnerContext.addPartner(`PARTNER${i}`);
      TestAssertion.assertTrue(result.success, `Should add partner ${i}`);
    }
    
    // Try to add a 6th partner
    const result = await this.partnerContext.addPartner('PARTNER6');
    TestAssertion.assertFalse(result.success, 'Should not allow adding 6th partner');
    TestAssertion.assertTrue(result.error.includes('Maximum'), 'Error should mention maximum limit');
    TestAssertion.assertEqual(this.partnerContext.partners.length, 5, 'Should still have only 5 partners');
  }

  async testPartnerListManagement() {
    await this.beforeEach();
    
    // Add three partners one by one
    await this.partnerContext.addPartner('PARTNER1');
    await this.partnerContext.addPartner('PARTNER2');
    await this.partnerContext.addPartner('PARTNER3');
    
    // Verify we have 3 partners
    TestAssertion.assertEqual(this.partnerContext.partners.length, 3, 'Should have 3 partners');
    
    // Remove one partner and verify count decreases
    const partnersBeforeRemoval = [...this.partnerContext.partners];
    const firstPartner = partnersBeforeRemoval[0];
    
    const removeResult = await this.partnerContext.removePartner(firstPartner.id);
    TestAssertion.assertTrue(removeResult.success, 'Should successfully remove partner');
    TestAssertion.assertEqual(this.partnerContext.partners.length, 2, 'Should have 2 partners after removal');
    
    // Verify the removed partner is no longer in the list
    const remainingIds = this.partnerContext.partners.map(p => p.id);
    TestAssertion.assertFalse(remainingIds.includes(firstPartner.id), 'Removed partner should not be in list');
    
    // Verify we can still add more partners after removal
    const addResult = await this.partnerContext.addPartner('PARTNER4');
    TestAssertion.assertTrue(addResult.success, 'Should be able to add new partner after removal');
    TestAssertion.assertEqual(this.partnerContext.partners.length, 3, 'Should have 3 partners after adding new one');
  }

  // Duplicate Partner Prevention Tests
  async testDuplicatePreventionSameCode() {
    await this.beforeEach();
    
    // Add a partner
    const result1 = await this.partnerContext.addPartner('TEST123');
    TestAssertion.assertTrue(result1.success, 'First addition should succeed');
    
    // Try to add the same partner again
    const result2 = await this.partnerContext.addPartner('TEST123');
    TestAssertion.assertFalse(result2.success, 'Duplicate addition should fail');
    TestAssertion.assertTrue(result2.error.includes('already connected'), 'Error should mention duplicate');
    TestAssertion.assertEqual(this.partnerContext.partners.length, 1, 'Should still have only one partner');
  }

  async testDuplicatePreventionCase() {
    await this.beforeEach();
    
    // Add a partner
    const result1 = await this.partnerContext.addPartner('TEST123');
    TestAssertion.assertTrue(result1.success, 'First addition should succeed');
    
    // Try to add with different case - should be allowed since codes are case-sensitive
    const result2 = await this.partnerContext.addPartner('test123');
    // Note: This test validates that partner codes are case-sensitive
    // 'TEST123' and 'test123' are treated as different codes
    TestAssertion.assertFalse(result2.success, 'Lowercase code should be invalid due to validation rules');
    TestAssertion.assertTrue(result2.error.includes('Invalid partner code format'), 'Should fail validation, not duplicate check');
  }

  async testDuplicatePreventionAfterRemoval() {
    await this.beforeEach();
    
    // Add a partner
    const addResult = await this.partnerContext.addPartner('TEST123');
    TestAssertion.assertTrue(addResult.success, 'Should add partner');
    
    // Remove the partner
    const removeResult = await this.partnerContext.removePartner(addResult.partner.id);
    TestAssertion.assertTrue(removeResult.success, 'Should remove partner');
    
    // Add the same partner again - should succeed
    const addAgainResult = await this.partnerContext.addPartner('TEST123');
    TestAssertion.assertTrue(addAgainResult.success, 'Should allow re-adding after removal');
    TestAssertion.assertEqual(this.partnerContext.partners.length, 1, 'Should have one partner');
  }

  // Data Persistence Tests
  async testPartnerDataPersistence() {
    await this.beforeEach();
    
    // Add partners
    await this.partnerContext.addPartner('PARTNER1');
    await this.partnerContext.addPartner('PARTNER2');
    
    // Simulate app restart by creating new context with same storage
    const newContext = new MockPartnerContext(this.mockStorage);
    await newContext.setTestUser({ id: '12345' });
    await newContext.loadPartners();
    
    TestAssertion.assertEqual(newContext.partners.length, 2, 'Partners should persist across sessions');
    const codes = newContext.partners.map(p => p.code);
    TestAssertion.assertTrue(codes.includes('PARTNER1'), 'PARTNER1 should persist');
    TestAssertion.assertTrue(codes.includes('PARTNER2'), 'PARTNER2 should persist');
  }

  async testStorageRecovery() {
    await this.beforeEach();
    
    // Add a partner
    await this.partnerContext.addPartner('TEST123');
    
    // Corrupt the storage data
    await this.mockStorage.setItem('partners', 'invalid-json');
    
    // Try to load partners - should recover gracefully
    await this.partnerContext.loadPartners();
    TestAssertion.assertEqual(this.partnerContext.partners.length, 0, 'Should recover with empty array on corrupt data');
  }

  // Error Handling Tests
  async testStorageErrorHandling() {
    await this.beforeEach();
    
    // Create a mock storage that throws errors on setItem
    const errorStorage = {
      getItem: async (key) => null,
      setItem: async () => { throw new Error('Storage error'); },
      removeItem: async () => { throw new Error('Storage error'); },
      clear: async () => {}
    };
    
    const errorContext = new MockPartnerContext(errorStorage);
    errorContext.user = { id: '12345', name: 'Test User', email: 'test@example.com' };
    
    const result = await errorContext.addPartner('TEST123');
    TestAssertion.assertFalse(result.success, 'Should handle storage errors gracefully');
    TestAssertion.assertExists(result.error, 'Should provide error message');
    TestAssertion.assertTrue(result.error.includes('Storage error'), 'Error should mention storage issue');
  }

  async testNetworkErrorHandling() {
    await this.beforeEach();
    
    // Simulate network delay and potential timeout
    const originalAddPartner = this.partnerContext.addPartner.bind(this.partnerContext);
    this.partnerContext.addPartner = async (code) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 10));
      return originalAddPartner(code);
    };
    
    const result = await this.partnerContext.addPartner('TEST123');
    TestAssertion.assertTrue(result.success, 'Should handle network delays');
    
    // Restore original method
    this.partnerContext.addPartner = originalAddPartner;
  }
}

export default PartnerLinkTestAgent;