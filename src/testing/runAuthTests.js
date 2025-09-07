// Auth Test Runner
// Script to run the authentication test suite

import { createAndRunAuthTests, createAuthTestAgent } from './agents/AuthTestAgent.js';

/**
 * Run all authentication tests
 */
async function runAuthTests() {
  console.log('🚀 Starting Authentication Test Suite...\n');
  
  try {
    const results = await createAndRunAuthTests();
    
    if (results.success) {
      console.log('🎉 All authentication tests passed!');
    } else {
      console.log('❌ Some authentication tests failed. Check the results above.');
    }
    
    return results;
  } catch (error) {
    console.error('💥 Error running authentication tests:', error);
    throw error;
  }
}

/**
 * Run specific test categories
 */
async function runSpecificTests() {
  const authTestAgent = createAuthTestAgent();
  
  // You can also run specific tests by accessing the internal methods
  console.log('🧪 Running custom test selection...\n');
  
  // Example of running just sign up tests
  const customRunner = new (await import('./TestFramework.js')).TestRunner('Custom Auth Tests');
  
  customRunner.addTest('Sign up with valid data', async () => {
    const mockAuth = new authTestAgent.authContext.constructor();
    const result = await mockAuth.signUp({
      name: 'Test User',
      email: 'test@example.com',
      role: 'tracker'
    });
    
    if (!result.success) {
      throw new Error('Sign up failed: ' + result.error);
    }
  });
  
  return await customRunner.run();
}

// Export functions for use in other modules
export {
  runAuthTests,
  runSpecificTests,
};

// If run directly, execute the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAuthTests()
    .then(() => {
      console.log('✅ Test execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}