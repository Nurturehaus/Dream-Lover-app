// Global teardown for Playwright tests
async function globalTeardown(config) {
  console.log('🏁 Starting global test teardown...');
  
  const fs = require('fs');
  const path = require('path');
  
  // Generate test summary report
  try {
    const testResultsPath = path.join(process.cwd(), 'test-results');
    const reportPath = path.join(process.cwd(), 'playwright-report');
    
    let summary = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      totalTests: 0,
      artifacts: {
        screenshots: 0,
        videos: 0,
        traces: 0
      },
      reports: {
        html: fs.existsSync(reportPath),
        json: fs.existsSync(path.join(testResultsPath, 'results.json')),
        junit: fs.existsSync(path.join(testResultsPath, 'junit.xml'))
      }
    };
    
    // Count artifacts
    if (fs.existsSync(testResultsPath)) {
      const files = fs.readdirSync(testResultsPath, { recursive: true });
      files.forEach(file => {
        if (typeof file === 'string') {
          if (file.endsWith('.png')) summary.artifacts.screenshots++;
          if (file.endsWith('.webm')) summary.artifacts.videos++;
          if (file.endsWith('.zip')) summary.artifacts.traces++;
        }
      });
    }
    
    // Read test results if available
    const resultsJsonPath = path.join(testResultsPath, 'results.json');
    if (fs.existsSync(resultsJsonPath)) {
      try {
        const results = JSON.parse(fs.readFileSync(resultsJsonPath, 'utf8'));
        if (results.stats) {
          summary.totalTests = results.stats.total || 0;
          summary.passed = results.stats.passed || 0;
          summary.failed = results.stats.failed || 0;
          summary.skipped = results.stats.skipped || 0;
        }
      } catch (error) {
        console.warn('⚠️  Could not parse test results:', error.message);
      }
    }
    
    // Write summary
    const summaryPath = path.join(testResultsPath, 'test-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    // Log summary
    console.log('📊 Test Summary:');
    console.log(`   Total Tests: ${summary.totalTests}`);
    if (summary.passed !== undefined) {
      console.log(`   ✅ Passed: ${summary.passed}`);
      console.log(`   ❌ Failed: ${summary.failed}`);
      console.log(`   ⏭️  Skipped: ${summary.skipped}`);
    }
    console.log(`   📸 Screenshots: ${summary.artifacts.screenshots}`);
    console.log(`   🎥 Videos: ${summary.artifacts.videos}`);
    console.log(`   🔍 Traces: ${summary.artifacts.traces}`);
    console.log(`   📄 Reports: HTML: ${summary.reports.html}, JSON: ${summary.reports.json}, JUnit: ${summary.reports.junit}`);
    
  } catch (error) {
    console.warn('⚠️  Could not generate test summary:', error.message);
  }
  
  // Clean up temporary files in CI
  if (process.env.CI) {
    console.log('🧹 Cleaning up temporary files...');
    try {
      const tempFiles = [
        '.nyc_output',
        'coverage',
        'node_modules/.cache'
      ];
      
      tempFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          fs.rmSync(filePath, { recursive: true, force: true });
          console.log(`🗑️  Cleaned up: ${file}`);
        }
      });
    } catch (error) {
      console.warn('⚠️  Could not clean up temporary files:', error.message);
    }
  }
  
  // Show report locations
  const reportPath = path.join(process.cwd(), 'playwright-report');
  if (fs.existsSync(reportPath)) {
    console.log(`📋 HTML Report: file://${reportPath}/index.html`);
  }
  
  const testResultsPath = path.join(process.cwd(), 'test-results');
  if (fs.existsSync(testResultsPath)) {
    console.log(`📁 Test Results: ${testResultsPath}`);
  }
  
  console.log('✅ Global teardown completed successfully!');
}

module.exports = globalTeardown;