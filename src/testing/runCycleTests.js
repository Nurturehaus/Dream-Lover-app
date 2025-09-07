// Run Cycle Tracking Tests
// Script to execute comprehensive cycle tracking tests

import { runAllTests } from './TestFramework.js';
import { createCycleTestAgent } from './agents/CycleTestAgent.js';

/**
 * Run all cycle tracking tests
 */
async function main() {
  console.log('🩸 Starting Cycle Tracking Test Suite...\n');
  
  try {
    // Create test agents
    const testAgents = [
      createCycleTestAgent(),
    ];
    
    // Run all tests
    const results = await runAllTests(testAgents);
    
    if (results.success) {
      console.log('✅ All cycle tracking tests passed!');
      process.exit(0);
    } else {
      console.log('❌ Some tests failed. Check the output above for details.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Error running cycle tests:', error);
    process.exit(1);
  }
}

// Run the tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as runCycleTests };
export default main;