// Authentication Test Agent for CareSync App
// Comprehensive testing for all authentication functionality

import { TestRunner, TestAssertion, MockStorage } from '../TestFramework.js';

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
 * Mock Authentication Context for isolated testing
 */
class MockAuthContext {
  constructor(mockStorage = new MockAsyncStorage()) {
    this.storage = mockStorage;
    this.user = null;
    this.isLoading = false;
    this.isFirstLaunch = false;
    this.partners = [];
  }

  // Reset all state for test isolation
  reset() {
    this.storage.clear();
    this.user = null;
    this.isLoading = false;
    this.isFirstLaunch = false;
    this.partners = [];
  }

  // Check auth state from storage
  async checkAuthState() {
    try {
      const userData = await this.storage.getItem('userData');
      const firstLaunch = await this.storage.getItem('hasLaunched');
      
      if (!firstLaunch) {
        this.isFirstLaunch = true;
        await this.storage.setItem('hasLaunched', 'true');
      }
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        this.user = parsedUser;
        
        // Load partners if they exist
        const partnersData = await this.storage.getItem('partners');
        if (partnersData) {
          this.partners = JSON.parse(partnersData);
        }
      }
      
      this.isLoading = false;
    } catch (error) {
      console.error('Error checking auth state:', error);
      this.isLoading = false;
    }
  }

  // Sign up functionality
  async signUp(userData) {
    try {
      // Validate required fields
      if (!userData.email || !userData.name || !userData.role) {
        return { success: false, error: 'Missing required fields' };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Validate role
      if (!['tracker', 'supporter'].includes(userData.role)) {
        return { success: false, error: 'Invalid role. Must be tracker or supporter' };
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString(),
      };
      
      await this.storage.setItem('userData', JSON.stringify(newUser));
      this.user = newUser;
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign in functionality
  async signIn(email, password) {
    try {
      // Validate inputs
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      const userData = await this.storage.getItem('userData');
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.email === email) {
          this.user = parsedUser;
          
          // Load partners
          const partnersData = await this.storage.getItem('partners');
          if (partnersData) {
            this.partners = JSON.parse(partnersData);
          }
          
          return { success: true, user: parsedUser };
        }
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign out functionality
  async signOut() {
    try {
      await this.storage.removeItem('userData');
      await this.storage.removeItem('partners');
      this.user = null;
      this.partners = [];
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }
  }

  // Update profile functionality
  async updateProfile(updates) {
    try {
      if (!this.user) {
        return { success: false, error: 'No user logged in' };
      }

      // Validate email if being updated
      if (updates.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
          return { success: false, error: 'Invalid email format' };
        }
      }

      // Validate role if being updated
      if (updates.role && !['tracker', 'supporter'].includes(updates.role)) {
        return { success: false, error: 'Invalid role' };
      }

      const updatedUser = { ...this.user, ...updates };
      await this.storage.setItem('userData', JSON.stringify(updatedUser));
      this.user = updatedUser;
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Add partner functionality
  async addPartner(partnerCode) {
    try {
      if (!partnerCode || partnerCode.length < 4) {
        return { success: false, error: 'Invalid partner code' };
      }

      // Check if partner already exists
      const existingPartner = this.partners.find(p => p.code === partnerCode);
      if (existingPartner) {
        return { success: false, error: 'Partner already linked' };
      }

      const newPartner = {
        id: Date.now().toString(),
        code: partnerCode,
        connectedAt: new Date().toISOString(),
        name: 'Partner',
      };
      
      const updatedPartners = [...this.partners, newPartner];
      await this.storage.setItem('partners', JSON.stringify(updatedPartners));
      this.partners = updatedPartners;
      
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

      const partnerExists = this.partners.some(p => p.id === partnerId);
      if (!partnerExists) {
        return { success: false, error: 'Partner not found' };
      }

      const updatedPartners = this.partners.filter(p => p.id !== partnerId);
      await this.storage.setItem('partners', JSON.stringify(updatedPartners));
      this.partners = updatedPartners;
      return { success: true };
    } catch (error) {
      console.error('Error removing partner:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate partner code
  generatePartnerCode() {
    if (!this.user) {
      return null;
    }
    return `${this.user.id}-${Date.now()}`.slice(-8).toUpperCase();
  }
}

/**
 * Comprehensive Authentication Test Agent
 */
export class AuthTestAgent extends TestRunner {
  constructor() {
    super('Authentication System');
    this.authContext = new MockAuthContext();
    this.setupTests();
  }

  setupTests() {
    // User Sign Up Tests
    this.addTest('Sign up with valid tracker data', () => this.testValidTrackerSignUp());
    this.addTest('Sign up with valid supporter data', () => this.testValidSupporterSignUp());
    this.addTest('Sign up with missing email', () => this.testSignUpMissingEmail());
    this.addTest('Sign up with invalid email format', () => this.testSignUpInvalidEmail());
    this.addTest('Sign up with missing name', () => this.testSignUpMissingName());
    this.addTest('Sign up with invalid role', () => this.testSignUpInvalidRole());
    this.addTest('Sign up with missing role', () => this.testSignUpMissingRole());

    // User Sign In Tests
    this.addTest('Sign in with correct credentials', () => this.testValidSignIn());
    this.addTest('Sign in with incorrect email', () => this.testSignInIncorrectEmail());
    this.addTest('Sign in with missing email', () => this.testSignInMissingEmail());
    this.addTest('Sign in with missing password', () => this.testSignInMissingPassword());
    this.addTest('Sign in without existing user', () => this.testSignInNoUser());

    // Sign Out Tests
    this.addTest('Sign out successfully', () => this.testSuccessfulSignOut());
    this.addTest('Sign out clears user data', () => this.testSignOutClearsData());
    this.addTest('Sign out clears partners data', () => this.testSignOutClearsPartners());

    // Profile Update Tests
    this.addTest('Update profile with valid data', () => this.testValidProfileUpdate());
    this.addTest('Update profile email', () => this.testUpdateProfileEmail());
    this.addTest('Update profile with invalid email', () => this.testUpdateProfileInvalidEmail());
    this.addTest('Update profile role', () => this.testUpdateProfileRole());
    this.addTest('Update profile with invalid role', () => this.testUpdateProfileInvalidRole());
    this.addTest('Update profile without login', () => this.testUpdateProfileNotLoggedIn());

    // Partner Linking Tests
    this.addTest('Add valid partner', () => this.testAddValidPartner());
    this.addTest('Add partner with invalid code', () => this.testAddInvalidPartner());
    this.addTest('Add duplicate partner', () => this.testAddDuplicatePartner());
    this.addTest('Remove existing partner', () => this.testRemoveValidPartner());
    this.addTest('Remove non-existent partner', () => this.testRemoveInvalidPartner());
    this.addTest('Remove partner with missing ID', () => this.testRemovePartnerMissingId());

    // First Launch Detection Tests
    this.addTest('Detect first launch', () => this.testFirstLaunchDetection());
    this.addTest('Subsequent launches not first', () => this.testSubsequentLaunches());

    // User Persistence Tests
    this.addTest('User persists across sessions', () => this.testUserPersistence());
    this.addTest('Partners persist across sessions', () => this.testPartnersPersistence());

    // Role Selection Tests
    this.addTest('Select tracker role', () => this.testTrackerRoleSelection());
    this.addTest('Select supporter role', () => this.testSupporterRoleSelection());

    // Partner Code Generation Tests
    this.addTest('Generate partner code when logged in', () => this.testPartnerCodeGeneration());
    this.addTest('Partner code generation when not logged in', () => this.testPartnerCodeGenerationNotLoggedIn());
  }

  // Setup method to ensure clean state before each test
  async setupTest() {
    this.authContext.reset();
  }

  // Sign Up Tests
  async testValidTrackerSignUp() {
    await this.setupTest();
    const userData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    };
    
    const result = await this.authContext.signUp(userData);
    
    TestAssertion.assertTrue(result.success, 'Sign up should succeed');
    TestAssertion.assertExists(result.user, 'User should be returned');
    TestAssertion.assertEqual(result.user.email, 'jane@example.com', 'Email should match');
    TestAssertion.assertEqual(result.user.role, 'tracker', 'Role should be tracker');
    TestAssertion.assertExists(result.user.id, 'User should have an ID');
    TestAssertion.assertExists(result.user.createdAt, 'User should have createdAt timestamp');
  }

  async testValidSupporterSignUp() {
    await this.setupTest();
    const userData = {
      name: 'John Smith',
      email: 'john@example.com',
      role: 'supporter'
    };
    
    const result = await this.authContext.signUp(userData);
    
    TestAssertion.assertTrue(result.success, 'Sign up should succeed');
    TestAssertion.assertEqual(result.user.role, 'supporter', 'Role should be supporter');
  }

  async testSignUpMissingEmail() {
    await this.setupTest();
    const userData = {
      name: 'Jane Doe',
      role: 'tracker'
    };
    
    const result = await this.authContext.signUp(userData);
    
    TestAssertion.assertFalse(result.success, 'Sign up should fail');
    TestAssertion.assertEqual(result.error, 'Missing required fields', 'Should indicate missing fields');
  }

  async testSignUpInvalidEmail() {
    await this.setupTest();
    const userData = {
      name: 'Jane Doe',
      email: 'invalid-email',
      role: 'tracker'
    };
    
    const result = await this.authContext.signUp(userData);
    
    TestAssertion.assertFalse(result.success, 'Sign up should fail');
    TestAssertion.assertEqual(result.error, 'Invalid email format', 'Should indicate invalid email');
  }

  async testSignUpMissingName() {
    await this.setupTest();
    const userData = {
      email: 'jane@example.com',
      role: 'tracker'
    };
    
    const result = await this.authContext.signUp(userData);
    
    TestAssertion.assertFalse(result.success, 'Sign up should fail');
    TestAssertion.assertEqual(result.error, 'Missing required fields', 'Should indicate missing fields');
  }

  async testSignUpInvalidRole() {
    await this.setupTest();
    const userData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'invalid-role'
    };
    
    const result = await this.authContext.signUp(userData);
    
    TestAssertion.assertFalse(result.success, 'Sign up should fail');
    TestAssertion.assertEqual(result.error, 'Invalid role. Must be tracker or supporter', 'Should indicate invalid role');
  }

  async testSignUpMissingRole() {
    await this.setupTest();
    const userData = {
      name: 'Jane Doe',
      email: 'jane@example.com'
    };
    
    const result = await this.authContext.signUp(userData);
    
    TestAssertion.assertFalse(result.success, 'Sign up should fail');
    TestAssertion.assertEqual(result.error, 'Missing required fields', 'Should indicate missing fields');
  }

  // Sign In Tests
  async testValidSignIn() {
    await this.setupTest();
    // First create a user
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    // Clear current user state
    this.authContext.user = null;
    
    const result = await this.authContext.signIn('jane@example.com', 'password123');
    
    TestAssertion.assertTrue(result.success, 'Sign in should succeed');
    TestAssertion.assertExists(result.user, 'User should be returned');
    TestAssertion.assertEqual(result.user.email, 'jane@example.com', 'Email should match');
  }

  async testSignInIncorrectEmail() {
    await this.setupTest();
    // First create a user
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    const result = await this.authContext.signIn('wrong@example.com', 'password123');
    
    TestAssertion.assertFalse(result.success, 'Sign in should fail');
    TestAssertion.assertEqual(result.error, 'Invalid credentials', 'Should indicate invalid credentials');
  }

  async testSignInMissingEmail() {
    await this.setupTest();
    const result = await this.authContext.signIn('', 'password123');
    
    TestAssertion.assertFalse(result.success, 'Sign in should fail');
    TestAssertion.assertEqual(result.error, 'Email and password are required', 'Should indicate missing email');
  }

  async testSignInMissingPassword() {
    await this.setupTest();
    const result = await this.authContext.signIn('jane@example.com', '');
    
    TestAssertion.assertFalse(result.success, 'Sign in should fail');
    TestAssertion.assertEqual(result.error, 'Email and password are required', 'Should indicate missing password');
  }

  async testSignInNoUser() {
    await this.setupTest();
    const result = await this.authContext.signIn('nouser@example.com', 'password123');
    
    TestAssertion.assertFalse(result.success, 'Sign in should fail');
    TestAssertion.assertEqual(result.error, 'Invalid credentials', 'Should indicate invalid credentials');
  }

  // Sign Out Tests
  async testSuccessfulSignOut() {
    await this.setupTest();
    // First sign up and sign in a user
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    const result = await this.authContext.signOut();
    
    TestAssertion.assertTrue(result.success, 'Sign out should succeed');
    TestAssertion.assertEqual(this.authContext.user, null, 'User should be null after sign out');
  }

  async testSignOutClearsData() {
    await this.setupTest();
    // Create and sign in user
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    await this.authContext.signOut();
    
    const userData = await this.authContext.storage.getItem('userData');
    TestAssertion.assertEqual(userData, null, 'User data should be cleared from storage');
  }

  async testSignOutClearsPartners() {
    await this.setupTest();
    // Create user and add partner
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    await this.authContext.addPartner('TESTCODE');
    
    await this.authContext.signOut();
    
    TestAssertion.assertArrayLength(this.authContext.partners, 0, 'Partners array should be empty');
    const partnersData = await this.authContext.storage.getItem('partners');
    TestAssertion.assertEqual(partnersData, null, 'Partners data should be cleared from storage');
  }

  // Profile Update Tests
  async testValidProfileUpdate() {
    await this.setupTest();
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    const updates = { name: 'Jane Smith' };
    const result = await this.authContext.updateProfile(updates);
    
    TestAssertion.assertTrue(result.success, 'Profile update should succeed');
    TestAssertion.assertEqual(result.user.name, 'Jane Smith', 'Name should be updated');
    TestAssertion.assertEqual(this.authContext.user.name, 'Jane Smith', 'Context user should be updated');
  }

  async testUpdateProfileEmail() {
    await this.setupTest();
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    const updates = { email: 'jane.smith@example.com' };
    const result = await this.authContext.updateProfile(updates);
    
    TestAssertion.assertTrue(result.success, 'Profile update should succeed');
    TestAssertion.assertEqual(result.user.email, 'jane.smith@example.com', 'Email should be updated');
  }

  async testUpdateProfileInvalidEmail() {
    await this.setupTest();
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    const updates = { email: 'invalid-email' };
    const result = await this.authContext.updateProfile(updates);
    
    TestAssertion.assertFalse(result.success, 'Profile update should fail');
    TestAssertion.assertEqual(result.error, 'Invalid email format', 'Should indicate invalid email');
  }

  async testUpdateProfileRole() {
    await this.setupTest();
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    const updates = { role: 'supporter' };
    const result = await this.authContext.updateProfile(updates);
    
    TestAssertion.assertTrue(result.success, 'Profile update should succeed');
    TestAssertion.assertEqual(result.user.role, 'supporter', 'Role should be updated');
  }

  async testUpdateProfileInvalidRole() {
    await this.setupTest();
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    const updates = { role: 'invalid-role' };
    const result = await this.authContext.updateProfile(updates);
    
    TestAssertion.assertFalse(result.success, 'Profile update should fail');
    TestAssertion.assertEqual(result.error, 'Invalid role', 'Should indicate invalid role');
  }

  async testUpdateProfileNotLoggedIn() {
    await this.setupTest();
    const updates = { name: 'Jane Smith' };
    const result = await this.authContext.updateProfile(updates);
    
    TestAssertion.assertFalse(result.success, 'Profile update should fail');
    TestAssertion.assertEqual(result.error, 'No user logged in', 'Should indicate no user logged in');
  }

  // Partner Tests
  async testAddValidPartner() {
    await this.setupTest();
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    const result = await this.authContext.addPartner('TESTCODE123');
    
    TestAssertion.assertTrue(result.success, 'Add partner should succeed');
    TestAssertion.assertExists(result.partner, 'Partner should be returned');
    TestAssertion.assertEqual(result.partner.code, 'TESTCODE123', 'Partner code should match');
    TestAssertion.assertArrayLength(this.authContext.partners, 1, 'Partners array should have one item');
  }

  async testAddInvalidPartner() {
    await this.setupTest();
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    const result = await this.authContext.addPartner('123'); // Too short
    
    TestAssertion.assertFalse(result.success, 'Add partner should fail');
    TestAssertion.assertEqual(result.error, 'Invalid partner code', 'Should indicate invalid partner code');
  }

  async testAddDuplicatePartner() {
    await this.setupTest();
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    await this.authContext.addPartner('TESTCODE123');
    const result = await this.authContext.addPartner('TESTCODE123');
    
    TestAssertion.assertFalse(result.success, 'Add duplicate partner should fail');
    TestAssertion.assertEqual(result.error, 'Partner already linked', 'Should indicate partner already exists');
  }

  async testRemoveValidPartner() {
    await this.setupTest();
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    const addResult = await this.authContext.addPartner('TESTCODE123');
    const result = await this.authContext.removePartner(addResult.partner.id);
    
    TestAssertion.assertTrue(result.success, 'Remove partner should succeed');
    TestAssertion.assertArrayLength(this.authContext.partners, 0, 'Partners array should be empty');
  }

  async testRemoveInvalidPartner() {
    await this.setupTest();
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    const result = await this.authContext.removePartner('nonexistent-id');
    
    TestAssertion.assertFalse(result.success, 'Remove partner should fail');
    TestAssertion.assertEqual(result.error, 'Partner not found', 'Should indicate partner not found');
  }

  async testRemovePartnerMissingId() {
    await this.setupTest();
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    const result = await this.authContext.removePartner('');
    
    TestAssertion.assertFalse(result.success, 'Remove partner should fail');
    TestAssertion.assertEqual(result.error, 'Partner ID is required', 'Should indicate missing partner ID');
  }

  // First Launch Tests
  async testFirstLaunchDetection() {
    await this.setupTest();
    await this.authContext.checkAuthState();
    
    TestAssertion.assertTrue(this.authContext.isFirstLaunch, 'Should detect first launch');
    
    const hasLaunched = await this.authContext.storage.getItem('hasLaunched');
    TestAssertion.assertEqual(hasLaunched, 'true', 'Should set hasLaunched flag');
  }

  async testSubsequentLaunches() {
    await this.setupTest();
    // Simulate previous launch
    await this.authContext.storage.setItem('hasLaunched', 'true');
    await this.authContext.checkAuthState();
    
    TestAssertion.assertFalse(this.authContext.isFirstLaunch, 'Should not detect first launch on subsequent runs');
  }

  // Persistence Tests
  async testUserPersistence() {
    await this.setupTest();
    const userData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    };
    
    await this.authContext.signUp(userData);
    const originalUserId = this.authContext.user.id;
    
    // Simulate app restart by creating new context with same storage
    const newAuthContext = new MockAuthContext(this.authContext.storage);
    await newAuthContext.checkAuthState();
    
    TestAssertion.assertExists(newAuthContext.user, 'User should persist across sessions');
    TestAssertion.assertEqual(newAuthContext.user.id, originalUserId, 'User ID should match');
    TestAssertion.assertEqual(newAuthContext.user.email, 'jane@example.com', 'User email should persist');
  }

  async testPartnersPersistence() {
    await this.setupTest();
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    await this.authContext.addPartner('TESTCODE123');
    const originalPartnerCount = this.authContext.partners.length;
    
    // Simulate app restart
    const newAuthContext = new MockAuthContext(this.authContext.storage);
    await newAuthContext.checkAuthState();
    
    TestAssertion.assertArrayLength(newAuthContext.partners, originalPartnerCount, 'Partners should persist');
    TestAssertion.assertEqual(newAuthContext.partners[0].code, 'TESTCODE123', 'Partner code should persist');
  }

  // Role Selection Tests
  async testTrackerRoleSelection() {
    await this.setupTest();
    const userData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    };
    
    const result = await this.authContext.signUp(userData);
    
    TestAssertion.assertTrue(result.success, 'Tracker role selection should succeed');
    TestAssertion.assertEqual(result.user.role, 'tracker', 'User role should be tracker');
  }

  async testSupporterRoleSelection() {
    await this.setupTest();
    const userData = {
      name: 'John Smith',
      email: 'john@example.com',
      role: 'supporter'
    };
    
    const result = await this.authContext.signUp(userData);
    
    TestAssertion.assertTrue(result.success, 'Supporter role selection should succeed');
    TestAssertion.assertEqual(result.user.role, 'supporter', 'User role should be supporter');
  }

  // Partner Code Generation Tests
  async testPartnerCodeGeneration() {
    await this.setupTest();
    await this.authContext.signUp({
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'tracker'
    });
    
    const partnerCode = this.authContext.generatePartnerCode();
    
    TestAssertion.assertExists(partnerCode, 'Partner code should be generated');
    TestAssertion.assertType(partnerCode, 'string', 'Partner code should be a string');
    TestAssertion.assertTrue(partnerCode.length > 0, 'Partner code should not be empty');
    TestAssertion.assertEqual(partnerCode, partnerCode.toUpperCase(), 'Partner code should be uppercase');
  }

  async testPartnerCodeGenerationNotLoggedIn() {
    await this.setupTest();
    const partnerCode = this.authContext.generatePartnerCode();
    
    TestAssertion.assertEqual(partnerCode, null, 'Partner code should be null when not logged in');
  }
}

/**
 * Factory function to create and run authentication tests
 * @returns {Promise<Object>} Test results
 */
export async function createAndRunAuthTests() {
  const authTestAgent = new AuthTestAgent();
  return await authTestAgent.run();
}

/**
 * Factory function to create the test agent without running
 * @returns {AuthTestAgent} The test agent instance
 */
export function createAuthTestAgent() {
  return new AuthTestAgent();
}

// Default export for convenience
export default {
  AuthTestAgent,
  createAndRunAuthTests,
  createAuthTestAgent,
};