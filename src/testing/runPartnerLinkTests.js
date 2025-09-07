// Partner Link Test Runner
// Script to run all partner linking tests

import { PartnerLinkTestAgent } from './agents/PartnerLinkTestAgent.js';

/**
 * Run partner link tests
 */
async function runPartnerLinkTests() {
  console.log('\n🔗 Starting Partner Link Testing Suite...');
  console.log('=' .repeat(60));
  
  try {
    const testAgent = new PartnerLinkTestAgent();
    const results = await testAgent.run();
    
    // Print detailed results summary
    console.log('\n📋 Detailed Test Results:');
    console.log('-'.repeat(40));
    
    const categories = {
      'QR Code Tests': [],
      'Partner Code Validation': [],
      'Adding Partners': [],
      'Manual Code Entry': [],
      'Partner Removal': [],
      'Multiple Partner Support': [],
      'Duplicate Prevention': [],
      'Data Persistence': [],
      'Error Handling': []
    };
    
    // Categorize results
    results.forEach(result => {
      const testName = result.name;
      if (testName.includes('QR Code')) {
        categories['QR Code Tests'].push(result);
      } else if (testName.includes('Partner Code Validation')) {
        categories['Partner Code Validation'].push(result);
      } else if (testName.includes('Add Partner')) {
        categories['Adding Partners'].push(result);
      } else if (testName.includes('Manual Code')) {
        categories['Manual Code Entry'].push(result);
      } else if (testName.includes('Remove Partner')) {
        categories['Partner Removal'].push(result);
      } else if (testName.includes('Multiple Partner')) {
        categories['Multiple Partner Support'].push(result);
      } else if (testName.includes('Duplicate')) {
        categories['Duplicate Prevention'].push(result);
      } else if (testName.includes('Persistence') || testName.includes('Storage Recovery')) {
        categories['Data Persistence'].push(result);
      } else if (testName.includes('Error Handling')) {
        categories['Error Handling'].push(result);
      }
    });
    
    // Print category summaries
    Object.entries(categories).forEach(([category, tests]) => {
      if (tests.length > 0) {
        const passed = tests.filter(t => t.status === 'PASSED').length;
        const failed = tests.filter(t => t.status === 'FAILED').length;
        const status = failed === 0 ? '✅' : '❌';
        
        console.log(`\n${status} ${category}: ${passed}/${tests.length} passed`);
        
        // Show failed tests
        tests.filter(t => t.status === 'FAILED').forEach(test => {
          console.log(`   ❌ ${test.name}: ${test.error}`);
        });
      }
    });
    
    // Final summary
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 Partner Link Testing Complete!');
    console.log(`   Total Tests: ${results.length}`);
    console.log(`   ✅ Passed: ${testAgent.passed}`);
    console.log(`   ❌ Failed: ${testAgent.failed}`);
    console.log(`   📊 Success Rate: ${((testAgent.passed / results.length) * 100).toFixed(1)}%`);
    
    if (testAgent.failed === 0) {
      console.log('\n🎉 All partner linking functionality tests passed!');
      console.log('   Your partner linking feature is ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review and fix the issues before deploying.');
    }
    
    console.log('=' .repeat(60) + '\n');
    
    return {
      success: testAgent.failed === 0,
      totalTests: results.length,
      passed: testAgent.passed,
      failed: testAgent.failed,
      results: results
    };
    
  } catch (error) {
    console.error('❌ Error running partner link tests:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for use in other test files
export { runPartnerLinkTests };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPartnerLinkTests().then(results => {
    process.exit(results.success ? 0 : 1);
  });
}