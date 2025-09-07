// Global setup for Playwright tests
async function globalSetup(config) {
  console.log('🚀 Starting global test setup...');
  
  // Ensure test directories exist
  const fs = require('fs');
  const path = require('path');
  
  const directories = [
    'test-results',
    'playwright-report',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces'
  ];
  
  for (const dir of directories) {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }
  
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.TESTING = 'true';
  
  // Clear any existing test data
  console.log('🧹 Clearing test artifacts...');
  const testResultsPath = path.join(process.cwd(), 'test-results');
  if (fs.existsSync(testResultsPath)) {
    const files = fs.readdirSync(testResultsPath);
    files.forEach(file => {
      if (file.endsWith('.png') || file.endsWith('.webm') || file.endsWith('.zip')) {
        const filePath = path.join(testResultsPath, file);
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.warn(`⚠️  Could not delete ${file}: ${error.message}`);
        }
      }
    });
  }
  
  // Log test environment info
  console.log(`🔧 Test Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Base URL: ${config.use?.baseURL || 'http://localhost:8081'}`);
  console.log(`🎭 Projects: ${config.projects?.map(p => p.name).join(', ') || 'default'}`);
  console.log(`👥 Workers: ${config.workers || 'auto'}`);
  console.log(`🔄 Retries: ${config.retries || 0}`);
  
  console.log('✅ Global setup completed successfully!');
}

module.exports = globalSetup;