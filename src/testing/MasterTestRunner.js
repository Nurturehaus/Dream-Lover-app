#!/usr/bin/env node

import { runAllTests } from './TestFramework.js';
import { createAuthTestAgent } from './agents/AuthTestAgent.js';
import { createCycleTestAgent } from './agents/CycleTestAgent.js';
import { createUITestAgent } from './agents/UITestAgent.js';
import PlaywrightTestAgent from './agents/PlaywrightTestAgent.js';

// Test execution configuration
const TEST_CONFIG = {
  runAuth: true,
  runCycle: true,
  runUI: true,
  runPlaywright: true,
  verbose: true,
  stopOnFailure: false,
};

// Custom console for better output formatting
class TestConsole {
  static header(text) {
    console.log('\n' + '🔷'.repeat(30));
    console.log(`🚀 ${text}`);
    console.log('🔷'.repeat(30) + '\n');
  }

  static section(text) {
    console.log('\n' + '─'.repeat(50));
    console.log(`📋 ${text}`);
    console.log('─'.repeat(50));
  }

  static success(text) {
    console.log(`✅ ${text}`);
  }

  static error(text) {
    console.log(`❌ ${text}`);
  }

  static info(text) {
    console.log(`ℹ️  ${text}`);
  }

  static warning(text) {
    console.log(`⚠️  ${text}`);
  }
}

// Test result analyzer
class TestResultAnalyzer {
  static analyzeResults(results) {
    const analysis = {
      totalSuites: results.details.length,
      totalTests: results.totalPassed + results.totalFailed,
      passedTests: results.totalPassed,
      failedTests: results.totalFailed,
      successRate: ((results.totalPassed / (results.totalPassed + results.totalFailed)) * 100).toFixed(1),
      failedSuites: [],
      criticalFailures: [],
      warnings: [],
    };

    // Analyze each suite
    results.details.forEach(suite => {
      const failedTests = suite.results.filter(test => test.status === 'FAILED');
      
      if (failedTests.length > 0) {
        analysis.failedSuites.push({
          name: suite.agent,
          failedCount: failedTests.length,
          failures: failedTests,
        });

        // Check for critical failures
        failedTests.forEach(test => {
          if (this.isCriticalTest(test.name)) {
            analysis.criticalFailures.push({
              suite: suite.agent,
              test: test.name,
              error: test.error,
            });
          }
        });
      }

      // Check for warnings (tests that passed but might have issues)
      const warningTests = suite.results.filter(test => 
        test.status === 'PASSED' && this.shouldWarn(test.name)
      );
      
      if (warningTests.length > 0) {
        analysis.warnings.push({
          suite: suite.agent,
          tests: warningTests.map(t => t.name),
        });
      }
    });

    return analysis;
  }

  static isCriticalTest(testName) {
    const criticalKeywords = [
      'sign up', 'sign in', 'authentication',
      'data persistence', 'cycle calculation',
      'security', 'validation'
    ];
    
    return criticalKeywords.some(keyword => 
      testName.toLowerCase().includes(keyword)
    );
  }

  static shouldWarn(testName) {
    // Tests that might need attention even if passing
    const warningKeywords = ['edge case', 'boundary', 'migration'];
    return warningKeywords.some(keyword => 
      testName.toLowerCase().includes(keyword)
    );
  }

  static generateReport(analysis) {
    TestConsole.section('TEST ANALYSIS REPORT');
    
    console.log('\n📊 Overall Statistics:');
    console.log(`   Test Suites: ${analysis.totalSuites}`);
    console.log(`   Total Tests: ${analysis.totalTests}`);
    console.log(`   Passed: ${analysis.passedTests} ✅`);
    console.log(`   Failed: ${analysis.failedTests} ❌`);
    console.log(`   Success Rate: ${analysis.successRate}%`);
    
    if (analysis.criticalFailures.length > 0) {
      console.log('\n🚨 CRITICAL FAILURES:');
      analysis.criticalFailures.forEach(failure => {
        console.log(`   ${failure.suite} → ${failure.test}`);
        console.log(`      Error: ${failure.error}`);
      });
    }
    
    if (analysis.failedSuites.length > 0) {
      console.log('\n📝 Failed Suites Summary:');
      analysis.failedSuites.forEach(suite => {
        console.log(`   ${suite.name}: ${suite.failedCount} failures`);
        if (TEST_CONFIG.verbose) {
          suite.failures.forEach(test => {
            console.log(`      - ${test.name}`);
          });
        }
      });
    }
    
    if (analysis.warnings.length > 0 && TEST_CONFIG.verbose) {
      console.log('\n⚠️  Warnings:');
      analysis.warnings.forEach(warning => {
        console.log(`   ${warning.suite}:`);
        warning.tests.forEach(test => {
          console.log(`      - ${test}`);
        });
      });
    }
    
    // Final verdict
    console.log('\n' + '═'.repeat(50));
    if (analysis.failedTests === 0) {
      TestConsole.success('ALL TESTS PASSED! 🎉');
      console.log('The app components are functioning correctly.');
    } else if (analysis.criticalFailures.length > 0) {
      TestConsole.error('CRITICAL FAILURES DETECTED! 🔴');
      console.log('High-priority issues need immediate attention.');
    } else {
      TestConsole.warning('SOME TESTS FAILED ⚠️');
      console.log('Review failed tests and fix issues before deployment.');
    }
    console.log('═'.repeat(50) + '\n');
    
    return analysis;
  }
}

// Main test execution
async function runMasterTestSuite() {
  TestConsole.header('CARESYNC APP - MASTER TEST SUITE');
  TestConsole.info(`Starting comprehensive testing at ${new Date().toLocaleString()}`);
  
  const testAgents = [];
  
  // Add test agents based on configuration
  if (TEST_CONFIG.runAuth) {
    TestConsole.info('Preparing Authentication Test Agent...');
    testAgents.push(createAuthTestAgent());
  }
  
  if (TEST_CONFIG.runCycle) {
    TestConsole.info('Preparing Cycle Tracking Test Agent...');
    testAgents.push(createCycleTestAgent());
  }
  
  if (TEST_CONFIG.runUI) {
    TestConsole.info('Preparing UI Components Test Agent...');
    testAgents.push(createUITestAgent());
  }
  
  if (TEST_CONFIG.runPlaywright) {
    TestConsole.info('Preparing Playwright Web UI Test Agent...');
    testAgents.push(new PlaywrightTestAgent());
  }
  
  if (testAgents.length === 0) {
    TestConsole.warning('No test agents configured to run!');
    return;
  }
  
  try {
    // Run all tests
    const results = await runAllTests(testAgents);
    
    // Analyze results
    const analysis = TestResultAnalyzer.analyzeResults(results);
    
    // Generate report
    TestResultAnalyzer.generateReport(analysis);
    
    // Check if we should stop on failure
    if (TEST_CONFIG.stopOnFailure && results.totalFailed > 0) {
      TestConsole.error('Stopping due to test failures (stopOnFailure is enabled)');
      process.exit(1);
    }
    
    // Return appropriate exit code
    process.exit(results.totalFailed > 0 ? 1 : 0);
    
  } catch (error) {
    TestConsole.error(`Test execution failed: ${error.message}`);
    console.error(error.stack);
    process.exit(2);
  }
}

// Test suite selector (for running specific tests)
async function runSelectedTests(suites = []) {
  const availableSuites = {
    auth: createAuthTestAgent,
    cycle: createCycleTestAgent,
    ui: createUITestAgent,
    playwright: () => new PlaywrightTestAgent(),
  };
  
  const testAgents = [];
  
  suites.forEach(suite => {
    if (availableSuites[suite]) {
      testAgents.push(availableSuites[suite]());
      TestConsole.info(`Added ${suite} test suite`);
    } else {
      TestConsole.warning(`Unknown test suite: ${suite}`);
    }
  });
  
  if (testAgents.length > 0) {
    return await runAllTests(testAgents);
  } else {
    TestConsole.error('No valid test suites selected');
    return null;
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    suites: [],
    verbose: false,
    stopOnFailure: false,
  };
  
  args.forEach(arg => {
    if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
      TEST_CONFIG.verbose = true;
    } else if (arg === '--stop-on-failure') {
      options.stopOnFailure = true;
      TEST_CONFIG.stopOnFailure = true;
    } else if (arg.startsWith('--suite=')) {
      const suite = arg.split('=')[1];
      options.suites.push(suite);
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
CareSync Test Runner

Usage: node MasterTestRunner.js [options]

Options:
  --suite=NAME     Run specific test suite (auth, cycle, ui, playwright)
  --verbose, -v    Show detailed test output
  --stop-on-failure Stop execution on first failure
  --help, -h       Show this help message

Examples:
  node MasterTestRunner.js                    # Run all tests
  node MasterTestRunner.js --suite=auth       # Run auth tests only
  node MasterTestRunner.js --suite=playwright # Run Playwright UI tests only
  node MasterTestRunner.js --verbose          # Run with detailed output
  node MasterTestRunner.js --suite=auth --suite=playwright  # Run multiple suites
      `);
      process.exit(0);
    }
  });
  
  return options;
}

// Export for use in other scripts
export {
  runMasterTestSuite,
  runSelectedTests,
  TestResultAnalyzer,
  TestConsole,
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs();
  
  if (options.suites.length > 0) {
    // Run selected suites
    TEST_CONFIG.runAuth = options.suites.includes('auth');
    TEST_CONFIG.runCycle = options.suites.includes('cycle');
    TEST_CONFIG.runUI = options.suites.includes('ui');
    TEST_CONFIG.runPlaywright = options.suites.includes('playwright');
  }
  
  runMasterTestSuite();
}